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
import { getAuctionStatus, getAuctionStatusWeight, getCurrentTimeSeconds } from "../lib/tools"
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

const getTopAuctions = (cb) => auctions
  .then(auc => auc
    .auctions({})
    .then(res => Promise.all(res.auctions
      .map(auction => auc
        .bid({ id: auction.bid_id })
        .then(bid => {
          return {
            domain: auction.domain,
            topBidAmount: bid.amount,
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
  const [ownedDomains, setOwnedDomains] = React.useState(false)
  const [topAuctions, setTopAuctions] = React.useState(false)
  const getWallet = () => {
    getWalletAddr((a) => {
      setAddr(a)
      resolveKujiraAddr(a, setName)
      getOwnedDomains(a, setOwnedDomains)
    })
  }
  React.useEffect(getWallet, [])
  React.useEffect(() => {
    getTopAuctions(setTopAuctions)
    const interval = setInterval(() => getTopAuctions(setTopAuctions), 3000)
    return () => clearInterval(interval)
  }, [])
  window.addEventListener("keplr_keystorechange", getWallet)

  return (
    <Layout walletName={name} walletAddr={addr}>
      <Row>
        <Col sm={12} lg={6} xl={7}>
          <Panel title="Find Domains">
            <DomainSearch contracts={contracts}/>
          </Panel>
          <Panel title="My Domains">
            {
              !ownedDomains ?
                <p className="text-grey text-center">Loading domains...</p>
                : ownedDomains.length < 1 ?
                  <p className="text-grey text-center">No domains found in this wallet yet. Buy one and it will show up here!</p>
                  : <Col className="ps-xl-5 pe-xl-5">
                    <SortedTable
                      headers={["Name", "Status", "Expiration"]}
                      data={
                        ownedDomains.map(d => [
                          () => <FormatName>{d.name}</FormatName>,
                          d.status,
                          d.expiration.toLocaleDateString()
                        ])
                      }
                      sort={[
                        (x, y) => x().props.children.localeCompare(y().props.children),
                        (x, y) => getDomainStatusWeight(y) - getDomainStatusWeight(x),
                        (x, y) => new Date(y) - new Date(x)
                      ]}
                      sortDefault={1}
                      styles={["text-start", "text-start d-none d-md-block", "text-end"]}
                      rowStyles={(row) => getDomainStatusColor(row[1])}
                      rowLinks={(row) => `/${row[0]}`}
                    />
                  </Col>
            }
          </Panel>
        </Col>
        <Col>
          <Panel title="Top Auctions">
            {
              !topAuctions ?
                <p className="text-grey text-center">Loading auctions...</p>
                : topAuctions.length < 1 ?
                  <p className="text-grey text-center">No auctions found.</p>
                  : <SortedTable
                    headers={["Name", "Status", "Price"]}
                    data={
                      topAuctions.map(a => [
                        () => <FormatName>{a.domain}</FormatName>,
                        a.status,
                        () => <Denom
                          amount={a.topBidAmount}
                          base={denomBase}
                          display={denomDisplay}
                          exponent={denomExponent}
                        />
                      ])
                    }
                    sort={[
                      (x, y) => x().props.children.localeCompare(y().props.children),
                      (x, y) => getAuctionStatusWeight(y) - getAuctionStatusWeight(x),
                      (x, y) => y().props.amount - x().props.amount,
                    ]}
                    sortDefault={2}
                    rowStyles={() => "text-light"}
                    styles={["text-start", "text-start", "text-end"]}
                  />
                  // : <Table variant="grey" size="sm" borderless striped hover>
                  //   <thead className="text-muted">
                  //     <tr>
                  //       <td>#</td>
                  //       <td>Name</td>
                  //       <td>Status</td>
                  //       <td className="text-end">Price</td>
                  //     </tr>
                  //   </thead>
                  //   <tbody>
                  //     {
                  //       topAuctions
                  //         .map((auction, i) => <tr>
                  //           <td className="text-muted">{i + 1}</td>
                  //           <td>
                  //             <a href={"/" + auction.domain} className="text-light text-decoration-none d-block">
                  //               <FormatName>{auction.domain}</FormatName>
                  //             </a>
                  //           </td>
                  //           <td><a href={"/" + auction.domain} className="text-light text-decoration-none d-block">{auction.status}</a></td>
                  //           <td className="text-end text-light">
                  //             <a href={"/" + auction.domain} className="text-light text-decoration-none d-block">
                  //               <Denom
                  //                 amount={auction.top_bid_amount}
                  //                 base={denomBase}
                  //                 display={denomDisplay}
                  //                 exponent={denomExponent}
                  //               />
                  //             </a>
                  //           </td>
                  //         </tr>)
                  //     }
                  //   </tbody>
                  // </Table>
            }
          </Panel>
        </Col>
      </Row>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
