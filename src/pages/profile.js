import { useAtom } from "jotai"
import * as React from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Layout from "../components/layout"
import {
  domainAtom,
  globalRefreshAtom,
  userBidsAtom,
  userDomainsAtom,
  walletAddrAtom,
  walletNameAtom,
  walletSignerAtom,
  showReverseModalAtom,
  registrarConfigAtom,
  auctionsSignerAtom,
} from "../lib/data"
import { compareAuctionStatus, compareNumber, compareString, getWalletSigner , getRegistrarConfig } from "../lib/tools"
import DomainModal from "../components/domain-modal"
import SetReverseModal from "../components/set-reverse-modal"
import SortedTable from "../components/sorted-table"
import { formatDenom, formatNameDomainModalTrigger } from "../lib/format"

const ProfilePage = () => {
  const [walletName] = useAtom(walletNameAtom)
  const [walletAddr] = useAtom(walletAddrAtom)
  const [, setWalletSigner] = useAtom(walletSignerAtom)
  const [, setGlobalRefresh] = useAtom(globalRefreshAtom)
  const [userDomains] = useAtom(userDomainsAtom)
  const [, setDomain] = useAtom(domainAtom)
  const [, setShowReverseModal] = useAtom(showReverseModalAtom)
  const [userBids] = useAtom(userBidsAtom)
  const [, setRegistrarConfig] = useAtom(registrarConfigAtom)
  const [auctionsSigner] = useAtom(auctionsSignerAtom)
  const refresh = () => {
    setWalletSigner(getWalletSigner())
    setRegistrarConfig(getRegistrarConfig())
    setDomain(null)
  }
  React.useEffect(() => { setGlobalRefresh({refresh: refresh}) }, [])
  React.useEffect(refresh, [])
  if (typeof window !== "undefined") {
    window.addEventListener("keplr_keystorechange", () => { setWalletSigner(getWalletSigner()) })
  }

  const getBidActionButton = (bid) => bid.status === "Closed" && bid.isTopBid ?
    <button
      className="md-button md-button--small md-button--outline"
      onClick={() => auctionsSigner.claimAuction({domain: bid.domain}).then(refresh).catch(console.log)}
    >
      Claim
    </button>
    : <button
        className="md-button md-button--small md-button--outline md-button--grey"
        onClick={() => setDomain(bid.domain)}>
      Details
      </button>

  return (
    <Layout>
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="box">
            <h3 className="color-white">{walletName}</h3>
            <h4 className="color-grey fw-bold fs-5">Address</h4>
            <button className="md-button md-button--outline d-block ms-3 mb-2" onClick={() => setShowReverseModal(true)}>
              Set Reverse Record
            </button>
            {
              walletAddr !== walletName ?
                <span className="color-white ps-3">{walletAddr} points to {walletName}</span>
                : <span className="color-white ps-3">No reverse record found.</span>
            }
            <h4 className="color-grey fw-bold fs-5 mt-2">Domains</h4>
            <ul style={{listStyle: "none"}} className="ps-2">
              {
                userDomains.state === "hasData" && userDomains.data ?
                  userDomains.data.length > 0 ?
                    userDomains.data.map(d => <li className="d-inline">
                        <button
                          className="color-white m-2 bg-transparent shadow-light border-0 p-0"
                          onClick={() => { setDomain(d) }}
                        >
                          <img style={{width: "20rem"}} src={`https://test-api.kujira.domains/v1/image/record/${d}`}/>
                        </button>
                      </li>
                    )
                    : <span className="color-white">No domains found.</span>
                  : <span className="color-white">Loading domains...</span>
              }
            </ul>
            <h4 className="color-grey fw-bold fs-5">Bids</h4>
            <div className="mx-5">
            {
              userBids.state === "hasData" ?
                userBids.data ? 
                  <SortedTable
                    headers={["Domain", "Status", "Amount", ""]}
                    data={userBids.data.map(b => [b.domain, b.status, b.amount, getBidActionButton(b)])}
                    view={[formatNameDomainModalTrigger(setDomain), null, formatDenom]}
                    sort={[compareString, compareAuctionStatus, compareNumber, null]}
                    sortDefault={2}
                    rowStyles="color-white align-middle"
                    styles={["text-start", "text-start", "text-end", "text-end"]}
                  />
                  : <p>No bids found.</p>
                : <p>Loading bids...</p>
            }
            </div>
          </div>
        </Col>
      </Row>
      <DomainModal/>
      <SetReverseModal/>
    </Layout>
  )
}

export default ProfilePage

export const Head = () => <title>Kujira Name System</title>