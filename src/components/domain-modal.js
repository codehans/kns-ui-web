import * as React from "react"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import FloatingLabel from "react-bootstrap/FloatingLabel"
import { atom, useAtom } from "jotai"

import Denom from "./denom"
import FormatName from "./format-name"
import FormatDate from "./format-date"
import { getRecordDisplayKind } from "../lib/tools"
import { denomBase, denomDisplay, denomFull, denomExponent } from "../lib/vars"
import {
  auctionAtom,
  auctionsSignerAtom,
  domainAtom,
  domainInfoAtom,
  globalRefreshAtom,
  recordAtom,
  userBalanceAtom,
  userDomainBidAtom,
  tokenAtom,
  walletAddrAtom,
  registrarSignerAtom,
} from "../lib/data"


const bidInputAtom = atom("")
const recordKindAtom = atom("kujira_addr")
const recordDataAtom = atom("")

const DomainModal = () => {
  const [bidInput, setBidInput] = useAtom(bidInputAtom)
  const [recordKind, setRecordKind] = useAtom(recordKindAtom)
  const [recordData, setRecordData] = useAtom(recordDataAtom)
  const [domain, setDomain] = useAtom(domainAtom)
  const [userBalance] = useAtom(userBalanceAtom)
  const [userDomainBid] = useAtom(userDomainBidAtom)
  const [auction] = useAtom(auctionAtom)
  const [token] = useAtom(tokenAtom)
  const [record] = useAtom(recordAtom)
  const [domainInfo] = useAtom(domainInfoAtom)
  const [auctionsSigner] = useAtom(auctionsSignerAtom)
  const [registrarSigner] = useAtom(registrarSignerAtom)
  const [globalRefresh] = useAtom(globalRefreshAtom)
  const [walletAddr] = useAtom(walletAddrAtom)
  
  const handleClose = () => {
    setDomain("")
    setBidInput("")
    setRecordKind("kujira_addr")
    setRecordData("")
  }
  const handleRecordKindChange = (event) => {
    setRecordKind(event.target.value)
  }
  const handleRecordDataChange = (event) => {
    setRecordData(event.target.value)
  }
  const handleBidChange = (event) => {
    setBidInput(event.target.value)
  }
  const handleClaim = (event) => {
    event.preventDefault()
    if (auctionsSigner) {
      auctionsSigner
        .claimAuction({ domain: domain })
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }
  const handlePlaceBid = (event) => {
    event.preventDefault()
    const bidAmount = Number(bidInput) * (10 ** denomExponent)
    if (auctionsSigner && bidAmount) {
      auctionsSigner
        .placeBid(
          { domain: domain },
          "auto",
          undefined,
          [{ denom: denomFull, amount: bidAmount.toString() }],
        )
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }
  const handleIncreaseBid = (event) => {
    event.preventDefault()
    const bidAmount = Number(bidInput) * (10 ** denomExponent)
    if (auctionsSigner && bidAmount) {
     auctionsSigner.increaseBid(
          { domain: domain },
          "auto",
          undefined,
          [{ denom: denomFull, amount: bidAmount.toString() }],
        )
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }
  const handleWithdrawBid = (event) => {
    event.preventDefault()
    if (auctionsSigner) {
      auctionsSigner.withdrawBid({ domain: domain })
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }
  const handleRegister = (event) => {
    event.preventDefault()
    if (registrarSigner) {
      registrarSigner
        .extension(
          {msg: {register: {token_id: domain, record_kind: recordKind, record_data: recordData}}}
        )
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }
  const handleBurn = (event) => {
    event.preventDefault()
    if (registrarSigner) {
      registrarSigner
        .burn({tokenId: domain})
        .then(globalRefresh.refresh)
        .catch(console.log)
    }
  }

  const hasDomainBid = userDomainBid.state === "hasData" && userDomainBid.data
  const isDomainAvailable = domainInfo.state === "hasData"
    && domainInfo.data
    && domainInfo.data.is_available
  const isTokenOwner = token.state === "hasData"
    && token.data
    && token.data.owner === walletAddr
    && token.data.status !== "Expired"
  const isTopBidder = auction.state === "hasData"
    && auction.data
    && auction.data.status === "Closed"
    && hasDomainBid
    && userDomainBid.data.isTopBid
  const isAuctionClosed = auction.state === "hasData"
    && auction.data
    && auction.data.status === "Closed"
  const isAuctionOpen = auction.state === "hasData"
    && auction.data
    && auction.data.status === "Open"

  return (
    <Modal show={domain && domain.length > 0} onHide={handleClose} centered>
      <Modal.Header closeButton className="color-white border-bottom-0">
        <h3><FormatName>{domain}</FormatName></h3>
      </Modal.Header>
      <Modal.Body>
        <Row className="mx-2 mt-2">
          <Col className="px-0">
            <h4 className="color-grey px-00">Auction</h4>
            <p className="fw-400 fs-6">
            {
              auction.state === "loading" ?
                <span className="text-muted">Loading auction details...</span>
                : !auction.data || auction.state === "hasError" ?
                  <span className="text-muted">No auction found.</span>
                  : <Row style={{paddingLeft: "0.8rem", paddingRight: "0.8rem"}}>
                    <Col md={6} className="px-0 pe-md-3">
                      <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                        <li>Status: 
                          <span style={{float: "right"}} className="color-white">
                          {auction.data.status}
                          </span>
                        </li>
                        <li>Close: 
                          <span style={{float: "right"}} className="color-white">
                            {
                              auction.data.closeTime ?
                                <FormatDate time={true}>{auction.data.closeTime}</FormatDate>
                                : <span>n/a</span>
                            }
                          </span>
                        </li>
                      </ul>
                    </Col>
                    <Col md={6} className="px-0 ps-md-3">
                      <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                        <li>Top Bid: 
                          <span style={{float: "right"}} className="color-white">
                            <Denom
                              amount={auction.data.topBidAmount}
                              base={denomBase}
                              display={denomDisplay}
                              exponent={denomExponent}
                            />
                          </span>
                        </li>
                        <li>Total Bids: 
                          <span style={{float: "right"}} className="color-white">
                            <Denom
                              amount={auction.data.totalBids}
                              base={denomBase}
                              display={denomDisplay}
                              exponent={denomExponent}
                            />
                          </span>
                        </li>
                      </ul>
                    </Col>
                  </Row>
            }
            </p>
          </Col>
        </Row>
        <Row className="mx-2">
          <Col md={6} className="bt px-0 pe-md-2">
            <h4 className="color-grey my-2">Record</h4>
            <p className="fw-400 fs-6">
            {
              record.state === "loading" ?
                <span className="text-muted">Loading record details...</span>
                : !record.data || record.state === "hasError" ?
                  <span className="text-muted">No record found.</span>
                  : <ul style={{listStyle: "none"}} className="ps-0 pe-md-2 mb-0 text-muted">
                    <li>Kind: 
                      <span style={{float: "right"}} className="color-white">
                        {getRecordDisplayKind(record.data.kind)}
                      </span>
                    </li>
                    <li>Data: 
                      <span style={{float: "right"}} className="color-white">
                        <FormatName>{record.data.data}</FormatName>
                      </span>
                    </li>
                  </ul>
            }
            </p>
          </Col>
          <Col md={6} className="bl-md bt px-0 ps-md-3 pt-2">
            <h4 className="color-grey d-inline-block mb-2">Token</h4>
            {
              token.state === "hasData" && token.data && (isTokenOwner || token.data.status === "Expired") ?
                <button
                  style={{float: "right"}}
                  className="md-button md-button--red md-button--outline md-button--small fs-10"
                  onClick={handleBurn}
                >
                  Burn
                </button>
                : <span></span>
            }
            <p className="fw-400 fs-6">
            {
              token.state === "loading" ?
                <span className="text-muted">Loading token details...</span>
                : !token.data || token.state === "hasError" ?
                  <span className="text-muted">No token found.</span>
                  : <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                    <li>Owner: 
                      <span style={{float: "right"}} className="color-white">
                        <FormatName>{token.data.owner}</FormatName>
                      </span>
                    </li>
                    <li>Expiration: 
                      <span style={{float: "right"}} className="color-white">
                        <FormatDate>{token.data.expiration}</FormatDate>
                      </span>
                    </li>
                  </ul>
            }
            </p>
          </Col>
        </Row>
        <Row className="mt-1">
          <Col>
            <p className="color-teal mx-1 mb-1">
              {
                userDomainBid.state === "hasData" && userDomainBid.data ?
                  <span>Your bid <span className="color-white" style={{float: "right"}}>
                    <Denom amount={userDomainBid.data.amount} base={denomBase} display={denomDisplay}/>
                  </span></span>
                  : !isTokenOwner && domainInfo.state === "hasData" && domainInfo.data ?
                    <span>Min. bid <span className="color-white" style={{float: "right"}}>
                      <Denom amount={domainInfo.data.base_price} base={denomBase} display={denomDisplay}/>
                    </span></span>
                    : <span></span>
              }
              <br/>
              {
                isTokenOwner ?
                  <span>You own this domain!</span>
                  : userBalance.state === "hasData" && userBalance.data ?
                    <span>You have <span className="color-white" style={{float: "right"}}>
                      <Denom amount={userBalance.data.amount} base={denomBase} display={denomDisplay}/>
                    </span></span>
                    : <span></span>
              }
            </p>
          </Col>
        </Row>
        <Form>
          {
            isTokenOwner ?
              <>
                <Form.Select onChange={handleRecordKindChange} className="md-input text-light bg-dark mb-1">
                  <option value="kujira_addr">Address</option>
                  <option value="domain">Domain</option>
                </Form.Select>
                <Form.Control type="text" placeholder="Record data" onChange={handleRecordDataChange} className="md-input text-light bg-dark"/>
              </>
              : <Form.Control
                type="number"
                placeholder={denomDisplay}
                className="md-input text-light bg-dark"
                onChange={handleBidChange}
              />
          }
          {
            isTokenOwner ?
              <button
                className="md-button md-button--full mt-2"
                onClick={handleRegister}
              >
                Register
              </button>
              : hasDomainBid ?
                isTopBidder ?
                  <button
                    className="md-button md-button--full mt-2"
                    onClick={handleClaim}
                  >
                    Claim Domain
                  </button>
                  : <>
                    <button
                      className="md-button md-button--full mt-2"
                      onClick={handleIncreaseBid}
                    >
                      Increase Bid
                    </button>
                    <button
                      className="md-button md-button--full md-button--outline md-button--red mt-1"
                      onClick={handleWithdrawBid}
                      disabled={isAuctionOpen ? "disabled" : null}
                    >
                      Withdraw Bid
                    </button>
                  </>
                : <button
                    className="md-button md-button--full mt-2"
                    onClick={handlePlaceBid}
                    disabled={
                      !isDomainAvailable || isAuctionClosed ? "disabled" : null
                    }
                  >
                    Place Bid
                  </button>
          }
          <a
            className="md-button md-button--outline md-button--full md-button--grey mt-1"
            href={`/${domain}`}
          >
            Details
          </a>
        </Form>
        {
          isTopBidder ? 
            <p className="color-white text-center mb-0 mt-3">You have the top bid!</p>
            : <span></span>
        }
      </Modal.Body>
    </Modal>
  )
}

export default DomainModal