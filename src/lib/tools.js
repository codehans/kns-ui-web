import * as vars from "./vars"
import { auctions, registrar, registry } from "./contracts"

const compareAuctionStatus = (x, y) => getAuctionStatusWeight(y) - getAuctionStatusWeight(x)

const compareDomainStatus = (x, y) => getDomainStatusWeight(y) - getDomainStatusWeight(x)

const compareNumber = (x, y) => Number(y) - Number(x)

const compareString = (x, y) => x.localeCompare(y)

const getAuctionCloseSeconds = (openStart) => !openStart ? null : Number(openStart) + vars.auctionsOpenDuration

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

const getAuctionsConfig = async () => auctions.then(a => a.config())

const getAuction = async (domain) => !domain ? null : auctions
  .then(a => a
    .auction({ domain: domain })
    .then(auction => a
      .bid({ id: auction.bid_id })
      .then(bid => getAuctionDetails(auction, bid))
    )
  )
  .catch(console.log)

const getRecord = async (domain) => !domain ? null : registry
  .then(r => r.record({ name: domain }))
  .catch(console.log)

const getToken = async (domain) => !domain ? null : registrar
  .then(r => Promise.all([
    r.nftInfo({ tokenId: domain }),
    r.ownerOf({ tokenId: domain }),
  ]))
  .then(res => {
    return {
      owner: res[1].owner,
      expiration: res[0].extension.expiration,
      status: getDomainStatus(res[0].extension.expiration)
    }
  })
  .catch(console.log)

const getDomainInfo = async (domain) => !domain ? null : registrar
  .then(r => r.domainInfo({ name: domain }))
  .catch(console.log)

const getCurrentTimeSeconds = () => Math.floor(Date.now() / 1000)

const getWalletSignerKeplr = async () => window.keplr
  .enable(vars.chainId)
  .then(() => window.getOfflineSigner(vars.chainId))
  .catch(console.log)

const getWalletSigner = () => {
  if (window.keplr) {
    return getWalletSignerKeplr()
  } else {
    return null
  }
}

const resolveKujiraAddr = async (addr) => !addr ? null : registry
  .then(r => r.kujiraAddr({ addr: addr }))
  .then(res => res.name)
  .catch(() => addr)


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
  const exp = Number(expiration)
  const now = getCurrentTimeSeconds()
  if (now < exp) {
    return "Active"
  } else if (now < (exp + vars.registrarGraceDuration)) {
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

const getUserBids = (addr, cb) => !addr ? null : auctions
    .then(a => a.bidsByBidder({ bidder: addr })
      .then(res => Promise.all(res.bids
        .map(bid => a
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
      )
    )
    .catch(console.log)

const getTopAuctions = async (state) => auctions
  .then(a => a.auctions({ state: state })
    .then(res => Promise.all(res.auctions.map(auction => a
        .bid({ id: auction.bid_id })
        .then(bid => getAuctionDetails(auction, bid))
    )))
  )
  .catch(console.log)

const getTopAuctionsDeposit = () => getTopAuctions("deposit")

const getTopAuctionsOpen = () => getTopAuctions("open")

const getTopAuctionsClosed = () => getTopAuctions("closed")

const getRecordDisplayKind = (kind) => {
  switch (kind) {
    case "kujira_addr":
      return "Address"
    case "ip4":
      return "IPv4"
    case "ip6":
      return "IPv6"
    case "ipfs":
      return "IPFS"
    default:
      return kind.toUpperCase()
  }
}

const getAuctionDetails = (auction, bid) => {
  return {
    domain: auction.domain,
    topBidAmount: bid.amount,
    topBidder: bid.bidder,
    totalBids: auction.total,
    status: getAuctionStatus(auction.open_start),
    closeTime: getAuctionCloseSeconds(auction.open_start),
  }
}

export {
  compareAuctionStatus,
  compareDomainStatus,
  compareNumber,
  compareString,
  getAuction,
  getAuctionCloseSeconds,
  getAuctionStatus,
  getAuctionStatusWeight,
  getAuctionsConfig,
  getRecord,
  getToken,
  getTopAuctionsOpen,
  getTopAuctionsClosed,
  getTopAuctionsDeposit,
  getCurrentTimeSeconds,
  getDomainStatus,
  getDomainStatusColor,
  getDomainStatusWeight,
  getDomainInfo,
  getRecordDisplayKind,
  getUserBids,
  getUserDomains,
  getWalletSigner,
  resolveKujiraAddr,
}