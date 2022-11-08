import * as vars from "./vars"
import { auctions, registrar, registry } from "../lib/contracts"

const compareAuctionStatus = (x, y) => getAuctionStatusWeight(y) - getAuctionStatusWeight(x)

const compareDomainStatus = (x, y) => getDomainStatusWeight(y) - getDomainStatusWeight(x)

const compareNumber = (x, y) => Number(y) - Number(x)

const compareString = (x, y) => x.localeCompare(y)

const getAuctionCloseSeconds = (openStart) => Number(openStart) + vars.auctionsOpenDuration

const getAuctionStatusWeight = (status) => {
  switch (status) {
    case "Open":
      return 3
    case "Deposit":
      return 2
    case "Closed":
      return 1
    default:
      return 0
  }
}

const getAuctionStatus = (openStart) => {
  if (!openStart) {
    return "Deposit"
  } else if (getCurrentTimeSeconds() < getAuctionCloseSeconds(openStart)) {
    return "Open"
  } else {
    return "Closed"
  }
}

const getCurrentTimeSeconds = () => Math.floor(Date.now() / 1000)

const getKeplrAddr = async (cb) => window.keplr
  .enable("harpoon-4")
  .then(() => window
    .getOfflineSigner("harpoon-4")
    .getAccounts()
    .then(accounts => cb(accounts[0].address))
  )

const getWalletAddr = async(cb) => {
  if (window.keplr) {
    getKeplrAddr(cb)
  } else {
    cb(false)
  }
}

const resolveKujiraAddr = async (addr, cb) => {
  if (!addr) {
    cb(false)
  }
  registry
    .then(reg => reg.kujiraAddr({ addr: addr }))
    .then(res => cb(res.name))
    .catch(() => cb(addr))
}


const getDomainStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "text-light"
    case "Expiring":
      return "text-warning"
    case "Expired":
      return "text-grey"
    default:
      return "text-light"
  }
}

const getDomainStatusWeight = (status) => {
  switch (status) {
    case "Active":
      return 3
    case "Expiring":
      return 2
    case "Expired":
      return 1
    default:
      return 0
  }
}

const getDomainStatus = (expiration) => {
  const now = getCurrentTimeSeconds()
  if (now < expiration) {
    return "Active"
  } else if (now < (expiration + vars.registrarGraceDuration)) {
    return "Expiring"
  } else {
    return "Expired"
  }
}

const getUserDomains = (addr, cb) => {
  if (!addr) {
    cb(false)
  }
  registrar
    .then(reg => reg.tokens({ owner: addr })
      .then(res => Promise.all(res.tokens
        .map(token => reg
          .nftInfo({ tokenId: token })
          .then(info => {
            return {
              name: token,
              status: getDomainStatus(Number(info.extension.expiration)),
              expiration: info.extension.expiration,
            }
          })
        ))
        .then(domains => cb(domains))
      )
    )
    .catch(() => cb(false))
}

const getUserBids = (addr, cb) => {
  if (!addr) {
    cb(false)
  }
  auctions
    .then(auc => auc.bidsByBidder({ bidder: addr })
      .then(res => Promise.all(res.bids
        .map(bid => auc
          .auction({ id: bid.auction_id })
          .then(auction => {
            return {
              domain: auction.domain,
              amount: bid.amount,
              isTopBid: bid.id === auction.bid_id,
              status: getAuctionStatus(auction.open_start)
            }
          })
        ))
        .then(bids => cb(bids))
      )
    )
    .catch((err) => cb(false))
}

const getOpenAuctions = (cb) => auctions
  .then(auc => auc
    .auctions({state: "open"})
    .then(res => Promise.all(res.auctions
      .map(auction => auc
        .bid({ id: auction.bid_id })
        .then(bid => {
          return {
            domain: auction.domain,
            topBidAmount: bid.amount,
            status: getAuctionStatus(auction.open_start),
            close: getAuctionCloseSeconds(auction.open_start)
          }
        })
      ))
      .then(openAuctions => cb(openAuctions))
    )
  )
  .catch(() => cb(false))

const getClosedAuctions = (cb) => auctions
  .then(auc => auc
    .auctions({state: "closed"})
    .then(res => Promise.all(res.auctions
      .map(auction => auc
        .bid({ id: auction.bid_id })
        .then(bid => {
          return {
            domain: auction.domain,
            topBidAmount: bid.amount,
            topBidder: bid.bidder,
            status: getAuctionStatus(auction.open_start),
          }
        })
      ))
      .then(closedAuctions => cb(closedAuctions))
    )
  )
  .catch(() => cb(false))

const getDepositAuctions = (cb) => auctions
  .then(auc => auc
    .auctions({state: "deposit"})
    .then(res => Promise.all(res.auctions
      .map(auction => auc
        .bid({ id: auction.bid_id })
        .then(bid => {
          return {
            domain: auction.domain,
            topBidAmount: bid.amount,
            total: auction.total,
            status: getAuctionStatus(Number(auction.open_start)),
          }
        })
      ))
      .then(depositAuctions => cb(depositAuctions))
    )
  )
  .catch(() => cb(false))

export {
  compareAuctionStatus,
  compareDomainStatus,
  compareNumber,
  compareString,
  getAuctionCloseSeconds,
  getAuctionStatus,
  getAuctionStatusWeight,
  getCurrentTimeSeconds,
  getClosedAuctions,
  getDepositAuctions,
  getDomainStatus,
  getDomainStatusColor,
  getDomainStatusWeight,
  getKeplrAddr,
  getOpenAuctions,
  getUserBids,
  getUserDomains,
  getWalletAddr,
  resolveKujiraAddr,
}