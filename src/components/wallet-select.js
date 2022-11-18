import * as React from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { FaUser, FaWallet } from "react-icons/fa"
import { useAtom } from "jotai"

import FormatName from "./format-name"
import { walletNameAtom, walletSelectShowAtom, walletSelectTypeAtom, walletSignerAtom } from "../lib/data"
import KeplrLogo from "../images/keplr.svg"
import WalletConnectLogo from "../images/wallet-connect.png"

const iconStyle = {width: "1em", marginBottom: "0.25em"}

const WalletSelect = () => {
  const [name] = useAtom(walletNameAtom)
  const [showSelect, setShowSelect] = useAtom(walletSelectShowAtom)
  const [type, setType] = useAtom(walletSelectTypeAtom)
  const [signer, setSigner] = useAtom(walletSignerAtom)

  if (!name) {
    return <>
      <Button variant="outline-primary" onClick={() => setShowSelect(true)}>
        <FaWallet style={iconStyle} className="text-grey me-2"/>&nbsp;
        CONNECT WALLET
      </Button>
      <Modal show={showSelect} onHide={() => setShowSelect(false)} className="color-white" centered>
        <Modal.Header>
          <h4>Connect Wallet</h4>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="mx-auto text-center">
              <button className="mx-auto md-button md-button--grey" style={{width: "12rem", height: "12rem"}}>
                <img src={KeplrLogo} alt="Keplr" style={{objectFit: "contain"}} className="w-75 h-75 m-auto"/>
              </button>
            </Col>
            <Col md={6} className="mx-auto text-center">
              <button className="mx-auto md-button md-button--grey" style={{width: "12rem", height: "12rem"}}>
                <img src={WalletConnectLogo} alt="Wallet Connect" style={{objectFit: "contain"}} className="w-75 h-75 m-auto"/>
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  }
  
  return <Button variant="outline-grey" href="/profile">
    <span className="color-white">
      {
        name.endsWith(".kuji") ?
          <FaUser style={iconStyle} className="text-secondary me-2"/>
          : <FaWallet style={iconStyle} className="text-secondary me-2"/>
      }
      &nbsp;
      <FormatName>{name}</FormatName>
    </span>
  </Button>
}

export default WalletSelect