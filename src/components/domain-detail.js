import * as React from "react"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"

import Denom from "./denom"
import FormatName from "../components/format-name"
import { getAuctionStatus } from "../lib/tools"
import { denomBase, denomDisplay, denomExponent } from "../lib/vars"

const getAuction = async (domain, auctions, cb) => auctions
  .then(auc => auc
    .auction({ domain: domain })
    .then(a => auc
      .bid({ id: a.bid_id })
      .then(b => cb({
        total: a.total,
        topBid: b.amount,
        depositStart: new Date(a.deposit_start * 1000),
        openStart: a.open_start ? new Date(a.open_start * 1000) : null,
      }))
    )
  )
  .catch(() => cb(false))

const getRecord = async (domain, registry, cb) => registry
  .then(reg => reg
    .record({ name: domain })
    .then(record => cb(record))
  )
  .catch(() => cb(false))

const getToken = async (domain, registrar, cb) => registrar
  .then(reg => Promise.all(
    [
      reg.nftInfo({ tokenId: domain }),
      reg.ownerOf({ tokenId: domain }),
    ])
    .then(res => cb({
      expiration: new Date(res[0].extension.expiration * 1000),
      owner: res[1].owner,
    }))
  )
  .catch(() => cb(false))

const getDisplayKind = (kind) => {
  switch (kind) {
    case "kujira_addr":
      return "Address"
    case "ip4":
      return "IPv4"
    case "ip6":
      return "IPv6"
    case "ipfs":
      return "IPFS"
  }
  return kind.toUpperCase()
}

const DomainDetail = ({domain, contracts}) => {
  const [auction, setAuction] = React.useState(false)
  const [record, setRecord] = React.useState(0)
  const [token, setToken] = React.useState(0)
  React.useEffect(() => { getAuction(domain, contracts.auctions, setAuction) }, [domain, contracts.auctions])
  React.useEffect(() => { getRecord(domain, contracts.registry, setRecord)}, [domain, contracts.registry])
  React.useEffect(() => { getToken(domain, contracts.registrar, setToken)}, [domain, contracts.registrar])

  return (
    <Container style={{borderRadius: "0.2em"}} fluid className="bg-dark bg-opacity-75 mt-1">
      <Row>
        <Col>
          <h5 className="text-light mt-1">{domain}</h5>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card bg="dark" className="p-2 mb-2">
            <Card.Title className="mb-1 text-grey">Auction</Card.Title>
              <Card.Body className="p-0">
              {
                auction === 0 ?
                  <p className="text-grey">Loading auction details...</p>
                  : !auction ?
                    <p className="text-grey">No auction found.</p>
                    : <Row>
                      <Col md={6} className="pe-md-3">
                        <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                          <li>Status: 
                            <span style={{float: "right"}} className="text-light">
                            {getAuctionStatus(auction)}
                            </span>
                          </li>
                          <li>Close: 
                            <span style={{float: "right"}} className="text-light">
                              {auction.openStart ? auction.openStart.toLocaleString() : "n/a"}
                            </span>
                          </li>
                        </ul>
                      </Col>
                      <Col md={6} className="ps-md-3">
                        <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                          <li>Top Bid: 
                            <span style={{float: "right"}} className="text-light">
                              <Denom
                                amount={auction.topBid}
                                base={denomBase}
                                display={denomDisplay}
                                exponent={denomExponent}
                              />
                            </span>
                          </li>
                          <li>Total Bids: 
                            <span style={{float: "right"}} className="text-light">
                              <Denom
                                amount={auction.total}
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
              </Card.Body>
            </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card bg="dark" className="p-2 mb-2">
            <Card.Title className="mb-1 text-grey">Record</Card.Title>
            <Card.Body className="p-0">
            {
              record === 0 ?
                <p className="text-grey">Loading record details...</p>
                : !record ?
                  <p className="text-grey">No record found.</p>
                  : <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                    <li>Kind: 
                      <span style={{float: "right"}} className="text-light">
                        {getDisplayKind(record.kind)}
                      </span>
                    </li>
                    <li>Data: 
                      <span style={{float: "right"}} className="text-light">
                        <FormatName>{record.data}</FormatName>
                      </span>
                    </li>
                  </ul>
            }
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card bg="dark" className="p-2 mb-2">
            <Card.Title className="mb-1 text-grey">Token</Card.Title>
              <Card.Body className="p-0">
              {
                token === 0 ?
                  <p className="text-grey">Loading token details...</p>
                  : !token ?
                    <p className="text-grey">No token found.</p>
                    : <ul style={{listStyle: "none"}} className="ps-0 mb-0 text-muted">
                      <li>Top Bid: 
                        <span style={{float: "right"}} className="text-light">
                          <FormatName>{token.owner}</FormatName>
                        </span>
                      </li>
                      <li>Expiration: 
                        <span style={{float: "right"}} className="text-light">
                          {token.expiration.toLocaleDateString()}
                        </span>
                      </li>
                    </ul>
              }
              </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DomainDetail
