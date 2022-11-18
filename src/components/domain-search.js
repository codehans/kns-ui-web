import { atom, useAtom } from "jotai"
import * as React from "react"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import {
  auctionAtom,
  auctionsSignerAtom,
  domainAtom,
  domainInfoAtom,
  globalRefreshAtom,
  recordAtom,
  userBalanceAtom,
  userBidsAtom,
  userDomainBidAtom,
  tokenAtom
} from "../lib/data"

import DomainModal from "./domain-modal"

const searchAtom = atom("")

const DomainSearch = () => {
  const [domain, setDomain] = useAtom(domainAtom)
  const [search, setSearch] = useAtom(searchAtom)

  const handleChange = (event) => {
    setSearch(event.target.value)
  }
  const handleSearch = (event) => {
    event.preventDefault()
    setDomain(search)
    setSearch("")
  }

  return (
    <Container fluid>
      <Form onSubmit={handleSearch}>
        <Row className="gx-0">
          <Col sm="9" className="px-1 ms-auto mt-2">
            <Form.Control
              type="text"
              placeholder="yourname.kuji"
              value={search}
              onChange={handleChange}
              className="text-light bg-dark md-input"
            />
          </Col>
          <Col sm="auto" className="px-1 me-auto mt-2">
            <button className="md-button md-button--full" type="submit">Search</button>
          </Col>
        </Row>
      </Form>
      <DomainModal/>
    </Container>
  )
}

export default DomainSearch
