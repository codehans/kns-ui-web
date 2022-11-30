
import * as React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { useAtom } from "jotai"

import DomainSearch from "../components/domain-search"
import Layout from "../components/layout"
import SortedTable from "../components/sorted-table"
import { formatDateTimeShort, formatDenom, formatName, formatNameDomainModalTrigger } from "../lib/format"
import {
  compareNumber,
  compareString,
  getAuctionsConfig,
  getTopAuctionsDeposit,
  getTopAuctionsOpen,
  getTopAuctionsClosed,
  getWalletSigner,
} from "../lib/tools"
import {
  auctionsConfigAtom,
  domainAtom,
  globalRefreshAtom,
  topAuctionsClosedAtom,
  topAuctionsDepositAtom,
  topAuctionsOpenAtom,
  walletSignerAtom,
} from "../lib/data"
import OpenAuctionsButton from "../components/open-auction-button"

const IndexPage = () => {
  const [, setAuctionsConfig] = useAtom(auctionsConfigAtom)
  const [topAuctionsDeposit, setTopAuctionsDeposit] = useAtom(topAuctionsDepositAtom)
  const [topAuctionsOpen, setTopAuctionsOpen] = useAtom(topAuctionsOpenAtom)
  const [topAuctionsClosed, setTopAuctionsClosed] = useAtom(topAuctionsClosedAtom)
  const [, setDomain] = useAtom(domainAtom)
  const [, setGlobalRefresh] = useAtom(globalRefreshAtom)
  const [, setWalletSigner] = useAtom(walletSignerAtom)
  const refresh = () => {
    setAuctionsConfig(getAuctionsConfig())
    setTopAuctionsDeposit(getTopAuctionsDeposit())
    setTopAuctionsOpen(getTopAuctionsOpen())
    setTopAuctionsClosed(getTopAuctionsClosed())
    setWalletSigner(getWalletSigner())
  }
  React.useEffect(() => { setGlobalRefresh({refresh: refresh}) }, [])
  React.useEffect(refresh, [])
  window.addEventListener("keplr_keystorechange", () => { setWalletSigner(getWalletSigner()) })

  return (
    <Layout>
      <Row style={{marginTop: "8rem", marginBottom: "10rem"}}>
        <Col lg={6} xl={5} xs={10} className="mx-auto">
          <h2 className="text-center color-white">Find your next domain</h2>
          <p className="text-center color-grey lead">Place a bid to get started!</p>
          <DomainSearch/>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <h2 className="color-white mb-3">Auctions</h2>
          <OpenAuctionsButton/>
        </Col>
      </Row>
      <Row className="mx-sm-5 px-md-5 px-lg-0 mx-lg-0 mx-xl-5">
        <Col lg={4} className="mt-5 px-3 px-xl-5">
          <h3 className="text-center color-grey mb-3">Pending</h3>
          {
            topAuctionsDeposit ?
              topAuctionsDeposit.length > 0 ?
                <SortedTable
                  headers={["Name", "Top Bid", "Total Bids"]}
                  data={topAuctionsDeposit.map(a => [a.domain, a.topBidAmount, a.totalBids])}
                  view={[formatNameDomainModalTrigger(setDomain), formatDenom, formatDenom]}
                  sort={[compareString, compareNumber, compareNumber]}
                  sortDefault={2}
                  rowStyles="color-white"
                  styles={["text-start", "text-start", "text-end"]}
                />
                : <p className="color-white text-center">No pending auctions.</p>
              : <span></span>
          }
        </Col>
        <Col lg={4} className="mt-5 px-3 px-xl-5 bl-lg">
          <h3 className="text-center color-grey mb-3">Open</h3>
          {
            topAuctionsOpen ?
              topAuctionsOpen.length > 0 ?
                <SortedTable
                  headers={["Name", "Price", "Close"]}
                  data={topAuctionsOpen.map(a => [a.domain, a.topBidAmount, a.closeTime])}
                  view={[formatNameDomainModalTrigger(setDomain), formatDenom, formatDateTimeShort]}
                  sort={[compareString, compareNumber, compareNumber]}
                  sortDefault={2}
                  sortReverse={true}
                  rowStyles="color-white"
                  styles={["text-start", "text-end", "text-end"]}
                />
                : <p className="color-white text-center">No open auctions.</p>
              : <span></span>
          }
        </Col>
        <Col lg={4} className="mt-5 px-3 px-xl-5 bl-lg">
          <h3 className="text-center color-grey mb-3">Closed</h3>
          {
            topAuctionsClosed ?
              topAuctionsClosed.length > 0 ?
                <SortedTable
                  headers={["Name", "Winner", "Price"]}
                  data={topAuctionsClosed.map(a => [a.domain, a.topBidder, a.topBidAmount])}
                  view={[formatNameDomainModalTrigger(setDomain), formatName, formatDenom]}
                  sort={[compareString, compareString, compareNumber]}
                  sortDefault={2}
                  rowStyles="color-white"
                  styles={["text-start", "text-start", "text-end"]}
                />
                : <p className="color-white text-center">No closed auctions.</p>
              : <span></span>
          }
        </Col>
      </Row>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Kujira Name System</title>
