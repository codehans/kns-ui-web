import { useAtom } from "jotai"
import * as React from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Layout from "../components/layout"
import { domainAtom, globalRefreshAtom, userDomainsAtom, walletAddrAtom, walletNameAtom, walletSignerAtom, showReverseModalAtom } from "../lib/data"
import { getWalletSigner } from "../lib/tools"
import DomainModal from "../components/domain-modal"
import SetReverseModal from "../components/set-reverse-modal"

const ProfilePage = () => {
  const [walletName] = useAtom(walletNameAtom)
  const [walletAddr] = useAtom(walletAddrAtom)
  const [, setWalletSigner] = useAtom(walletSignerAtom)
  const [, setGlobalRefresh] = useAtom(globalRefreshAtom)
  const [userDomains] = useAtom(userDomainsAtom)
  const [, setDomain] = useAtom(domainAtom)
  const [, setShowReverseModal] = useAtom(showReverseModalAtom)
  const refresh = () => {
    setWalletSigner(getWalletSigner())
  }
  React.useEffect(() => { setGlobalRefresh({refresh: refresh}) }, [])
  React.useEffect(refresh, [])
  if (typeof window !== "undefined") {
    window.addEventListener("keplr_keystorechange", () => { setWalletSigner(getWalletSigner()) })
  }


  return (
    <Layout>
      <Row>
        <Col md={6} className="mx-auto">
          <div className="box">
            <h3 className="color-white">{walletName}</h3>
            <h4 className="color-grey fw-bold fs-5">Domains</h4>
            <ul style={{listStyle: "none"}} className="ps-3">
              {
                userDomains.state === "hasData" && userDomains.data ?
                  userDomains.data.length > 0 ?
                    userDomains.data.map(d => <li>
                        <button
                          className="color-white mb-2"
                          style={{background: "none", border: "none", padding: "0"}}
                          onClick={() => { setDomain(d) }}
                        >
                          {d}
                        </button>
                      </li>
                    )
                    : <span className="color-white">No domains found.</span>
                  : <span className="color-white">Loading domains...</span>
              }
            </ul>
            <h4 className="color-grey fw-bold fs-5">Reverse</h4>
            <button className="md-button md-button--outline d-block ms-3 mb-2" onClick={() => setShowReverseModal(true)}>
              Set Reverse Record
            </button>
            {
              walletAddr !== walletName ?
                <span className="color-white ps-3">{walletAddr} points to {walletName}</span>
                : <span className="color-white ps-3">No reverse record found.</span>
            }
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