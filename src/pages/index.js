
import * as React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"

import DomainSearch from "../components/domain-search"
import Layout from "../components/layout"
import SortedTable from "../components/sorted-table"
import Panel from "../components/panel"
import { formatDateShort, formatDateTimeShort, formatDenom, formatName } from "../lib/format"
import {
  compareAuctionStatus,
  compareDomainStatus,
  compareNumber,
  compareString,
  getClosedAuctions,
  getDepositAuctions,
  getDomainStatusColor,
  getOpenAuctions,
  getUserBids,
  getUserDomains,
  getWalletAddr,
  resolveKujiraAddr,
} from "../lib/tools"

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
            <DomainSearch/>
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
                      view={[formatName, null, formatDateShort]}
                      sort={[compareString, compareDomainStatus, compareNumber]}
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
                    view={[formatName, null, formatDenom]}
                    sort={[compareString, compareAuctionStatus, compareNumber]}
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
                    view={[formatName, formatDenom, formatDateTimeShort]}
                    sort={[compareString, compareNumber, compareNumber]}
                    sortDefault={2}
                    rowLinks={row => `/${row[0]}`}
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
                    view={[formatName, formatDenom, formatDenom]}
                    sort={[compareString, compareNumber, compareNumber]}
                    sortDefault={2}
                    rowLinks={row => `/${row[0]}`}
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
                    view={[formatName, formatName, formatDenom]}
                    sort={[compareString, compareString, compareNumber]}
                    sortDefault={2}
                    rowLinks={row => `/${row[0]}`}
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
