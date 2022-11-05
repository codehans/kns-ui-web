import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import * as kujira from "kujira.js"
import * as React from "react"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table';

import Layout from '../components/layout'

const client = CosmWasmClient
  .connect({ url: "https://test-rpc-kujira.mintthemoon.xyz:443" })

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

const getKeplrAddr = async (cb) => window.keplr
  .enable("harpoon-4")
  .then(() => window
    .getOfflineSigner("harpoon-4")
    .getAccounts()
    .then(accounts => cb(accounts[0].address))
  )

const resolveKujiraAddr = async (addr, cb) => {
  if (!addr) {
    cb(false)
  }
  registry
    .then(reg => reg.kujiraAddr({ addr: addr }))
    .then(res => cb(res.name))
    .catch(() => cb(addr))
}

const getDomainStatus = (expiration) => {
  return "Active"
}

const getOwnedDomains = (addr, cb) => {
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
              status: getDomainStatus(info.extension.expiration),
              expiration: info.extension.expiration,
            }
          })
        ))
        .then(domains => cb(domains))
      )
    )
    .catch(() => cb(false))
}

const IndexPage = () => {
  const [addr, setAddr] = React.useState(false)
  const [name, setName] = React.useState(false)
  const [ownedDomains, setOwnedDomains] = React.useState(false)
  const getWallet = () => {
    getKeplrAddr((a) => {
      setAddr(a)
      resolveKujiraAddr(a, setName)
      getOwnedDomains(a, setOwnedDomains)
    })
  }
  React.useEffect(getWallet)
  window.addEventListener("keplr_keystorechange", getWallet)

  return (
    <Layout walletName={name} walletAddr={addr}>
      <Row>
        <Col sm={12} lg={7} xl={8}>
          <Card bg="grey" className="bg-opacity-10 mb-3">
            <Card.Title style={{fontSize: "1.8rem"}} className="text-light p-3 mb-1">Search Domains</Card.Title>
            <Card.Body className="pt-0 ps-5 pe-5">
              <Form>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="example.kuji"
                    className="text-light bg-dark bg-opacity-75 border-grey border-opacity-25"
                  >
                  </Form.Control>
                  <Button variant="outline-primary-light" className="border-opacity-75">Search</Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
          <Card bg="grey" className="bg-opacity-10">
            <Card.Title style={{fontSize: "1.8rem"}} className="text-light p-3 mb-1">My Domains</Card.Title>
            <Card.Body className="pt-0 ps-5 pe-5">
                {
                  ownedDomains && ownedDomains.length > 0 ?
                    <Table variant="grey" size="sm" borderless>
                      <thead className="text-primary-light fw-bold">
                        <tr>
                          <td>Name</td>
                          <td className="text-center">Status</td>
                          <td className="text-end">Expiration</td>
                        </tr>
                      </thead>
                      <tbody className="text-light">
                        {
                          ownedDomains.map(domain => <tr>
                            <td><a href={"/" + domain.name} className="text-reset text-decoration-none d-block">{domain.name}</a></td>
                            <td className="text-center">{domain.status}</td>
                            <td className="text-end">{domain.expiration}</td>
                          </tr>)
                        }
                      </tbody>
                    </Table>
                    : <p className="text-grey text-center">No domains found in this wallet yet. Buy one and it will show up here!</p>
                }
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="grey" className="bg-opacity-10">
            <Card.Title style={{fontSize: "1.8rem"}} className="text-light p-3 mb-1">Top Auctions</Card.Title>
            <Card.Body className="pt-0 pb-0">
              <Table variant="grey" size="sm" borderless className="text-light">
                <tbody>
                  <tr className="fw-bold">
                    <td className="text-grey">1</td>
                    <td className="text-primary-light"><a href="/mintthemoon.kuji" className="text-reset text-decoration-none d-block">mintthemoon.kuji</a></td>
                    <td className="text-end">420.69 <span className="text-muted">USK</span></td>
                  </tr>
                  <tr>
                    <td className="text-grey">2</td>
                    <td><a href="/codehans.kuji" className="text-reset text-decoration-none d-block">codehans.kuji</a></td>
                    <td className="text-end">69.99 <span className="text-muted">USK</span></td>
                  </tr>
                  <tr>
                    <td className="text-grey">3</td>
                    <td>test1.kuji</td>
                    <td className="text-end">25.01 <span className="text-muted">USK</span></td>
                  </tr>
                  <tr>
                    <td className="text-grey">4</td>
                    <td>test2.kuji</td>
                    <td className="text-end">24.00 <span className="text-muted">USK</span></td>
                  </tr>
                  <tr>
                    <td className="text-grey">5</td>
                    <td>test3.kuji</td>
                    <td className="text-end">23.50 <span className="text-muted">USK</span></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
