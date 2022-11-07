import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import * as kujira from "kujira.js"
import * as React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Table from "react-bootstrap/Table"

import Denom from "../components/denom"
import DomainSearch from "../components/domain-search"
import FormatName from "../components/format-name"
import Layout from "../components/layout"
import SortedTable from "../components/sorted-table"
import Panel from "../components/panel"
import {
  getAuctionCloseSeconds,
  getAuctionStatus,
  getAuctionStatusWeight,
  getCurrentTimeSeconds
} from "../lib/tools"
import { denomBase, denomDisplay, denomExponent, registrarGraceDuration } from "../lib/vars"

const client = CosmWasmClient
  .connect({ url: "https://test-rpc-kujira.mintthemoon.xyz:443" })

const auctions = client
  .then(client => new kujira.kns.auctions.AuctionsQueryClient(
    client,
    "kujira1w5hw9059pxgfqsn9paes8ztld3lcs7cw8mwe4kq9n8d85l59895qkzs7ca"
  ))

const registry = client
  .then(client => new kujira.kns.registry.RegistryQueryClient(
    client,
    "kujira1rm4ftqyg6efyjrqx8yfvg38u8vq586dg8yachc565qpawq4ppm8q5nwrjw"
  ))

const registrar = client
  .then(client => new kujira.kns.registrar.RegistrarQueryClient(
    client,
    "kujira1s7xhj5vf675ykgqruw70g3a7yes6eyysc8c4vmqaav0dks22cerqd3lfjy"
  ))

const contracts = {
  auctions: auctions,
  registrar: registrar,
  registry: registry,
}

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
  }
}

const getDomainStatus = (expiration) => {
  const now = getCurrentTimeSeconds()
  if (now < expiration) {
    return "Active"
  } else if (now < (expiration + registrarGraceDuration)) {
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
              expiration: new Date(info.extension.expiration * 1000),
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
      .then(topAuctions => cb(topAuctions))
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
      .then(topAuctions => cb(topAuctions))
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
      .then(topAuctions => cb(topAuctions))
    )
  )
  .catch(() => cb(false))

const IndexPage = () => {
  const [addr, setAddr] = React.useState(false)
  const [name, setName] = React.useState(false)
  const [userDomains, setUserDomains] = React.useState(false)
  const [userBids, setUserBids] = React.useState(false)
  const [openAuctions, setOpenAuctions] = React.useState(false)
  const [closedAuctions, setClosedAuctions] = React.useState(false)
  const [depositAuctions, setDepositAuctions] = React.useState(false)
  const getWallet = () => {
    getWalletAddr((a) => {
      setAddr(a)
      resolveKujiraAddr(a, setName)
      getUserDomains(a, setUserDomains)
      getUserBids(a, setUserBids)
    })
  }
  const tick = () => {
    getWallet()
    getOpenAuctions(setOpenAuctions)
    getClosedAuctions(setClosedAuctions)
    getDepositAuctions(setDepositAuctions)
  }
  React.useEffect(() => {
    tick()
    const interval = setInterval(() => tick(), 3000)
    return () => clearInterval(interval)
  }, [])
  window.addEventListener("keplr_keystorechange", getWallet)

  return (
    <Layout walletName={name} walletAddr={addr}>
      <Row>
        <Col sm={12} xl={7}>
          <Panel title="Find Domains">
            <DomainSearch contracts={contracts}/>
          </Panel>
          <Panel title="My Domains">
            {
              !userDomains ?
                <p className="text-grey text-center">Loading domains...</p>
                : userDomains.length < 1 ?
                  <p className="text-grey text-center">No domains found in this wallet yet. Buy one and it will show up here!</p>
                  : <Col className="ps-xl-5 pe-xl-5">
                    <SortedTable
                      headers={["Name", "Status", "Expiration"]}
                      data={userDomains.map(d => [d.name, d.status, d.expiration])}
                      view={[
                        x => <FormatName>{x}</FormatName>,
                        null,
                        x => x.toLocaleDateString(),
                      ]}
                      sort={[
                        (x, y) => x.localeCompare(y),
                        (x, y) => getDomainStatusWeight(y) - getDomainStatusWeight(x),
                        null
                      ]}
                      sortDefault={1}
                      styles={["text-start", "text-start d-none d-md-block", "text-end"]}
                      rowStyles={(row) => getDomainStatusColor(row[1])}
                      rowLinks={(row) => `/${row[0]}`}
                    />
                  </Col>
            }
          </Panel>
          <Panel title="My Bids">
          {
            !userBids ?
              <p className="text-grey text-center">Loading bids...</p>
              : userBids.length < 1 ?
                <p className="text-grey text-center">No bids found.</p>
                : <Col className="ps-xl-5 pe-xl-5">
                    <SortedTable
                    headers={["Name", "Status", "Bid"]}
                    data={userBids.map(b => [b.domain, b.status, b.amount])}
                    view={[
                      x => <FormatName>{x}</FormatName>,
                      null,
                      x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>,
                    ]}
                    sort={[
                      (x, y) => x.localeCompare(y),
                      (x, y) => getAuctionStatusWeight(y) - getAuctionStatusWeight(x),
                      (x, y) => Number(y) - Number(x),
                    ]}
                    sortDefault={1}
                    styles={["text-start", "text-start d-none d-md-block", "text-end"]}
                    rowLinks={row => `/${row[0]}`}
                    rowStyles="text-light"
                  />
                </Col>
          }
          </Panel>
        </Col>
        <Col sm={12} xl={5}>
          <Panel title="Open Auctions">
            {
              !openAuctions ?
                <p className="text-grey text-center">Loading auctions...</p>
                : openAuctions.length < 1 ?
                  <p className="text-grey text-center">No open auctions.</p>
                  : <SortedTable
                    headers={["Name", "Price", "Close"]}
                    data={openAuctions.map(a => [a.domain, a.topBidAmount, a.close])}
                    view={[
                      x => <FormatName>{x}</FormatName>,
                      x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>,
                      x => new Date(x * 1000).toLocaleString(
                        undefined,
                        {day: "numeric", month: "numeric", hour: "numeric", minute: "2-digit"}
                      )
                    ]}
                    sort={[
                      (x, y) => x.localeCompare(y),
                      (x, y) => Number(y) - Number(x),
                      (x, y) => new Date(y) - new Date(x),
                    ]}
                    sortDefault={2}
                    rowStyles="text-light"
                    styles={["text-start", "text-end", "text-end"]}
                  />
            }
          </Panel>
          <Panel title="Pending Auctions">
            {
              !depositAuctions ?
                <p className="text-grey text-center">Loading auctions...</p>
                : depositAuctions.length < 1 ?
                  <p className="text-grey text-center">No pending auctions.</p>
                  : <SortedTable
                    headers={["Name", "Top Bid", "Total Bids"]}
                    data={depositAuctions.map(a => [a.domain, a.topBidAmount, a.total])}
                    view={[
                      x => <FormatName>{x}</FormatName>,
                      x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>,
                      x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>,
                    ]}
                    sort={[
                      (x, y) => x.localeCompare(y),
                      (x, y) => Number(y) - Number(x),
                      (x, y) => Number(y) - Number(x),
                    ]}
                    sortDefault={2}
                    rowStyles="text-light"
                    styles={["text-start", "text-start d-none d-md-block", "text-end"]}
                  />
            }
          </Panel>
          <Panel title="Closed Auctions">
            {
              !closedAuctions ?
                <p className="text-grey text-center">Loading auctions...</p>
                : closedAuctions.length < 1 ?
                  <p className="text-grey text-center">No closed auctions.</p>
                  : <SortedTable
                    headers={["Name", "Winner", "Price"]}
                    data={closedAuctions.map(a => [a.domain, a.topBidder, a.topBidAmount])}
                    view={[
                      x => <FormatName>{x}</FormatName>,
                      x => <FormatName>{x}</FormatName>,
                      x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>,
                    ]}
                    sort={[
                      (x, y) => x.localeCompare(y),
                      (x, y) => x.localeCompare(y),
                      (x, y) => Number(y) - Number(x),
                    ]}
                    sortDefault={2}
                    rowStyles="text-light"
                    styles={["text-start", "text-start d-none d-md-block d-xl-none", "text-end"]}
                  />
            }
          </Panel>
        </Col>
      </Row>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
