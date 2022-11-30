import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/montserrat'

import '../styles/kujira-bundle.css'
import '../styles/theme.scss'
import KujiLogo from '../images/logo.svg'
import WalletSelect from './wallet-select.js'

const Layout = ({walletName, walletAddr, children}) => {
  return (
    <Container
      fluid
      style={{
        background: "radial-gradient(at 60% 10%,rgb(34,36,47) 0%,rgb(22,23,33) 100%)",
        fontFamily: "Montserrat, Fira Sans, sans-serif",
        height: "100%",
        minHeight: "100vh",
        padding: "0px",
      }}
    >
      <Navbar style={{minHeight: "6rem"}} bg="transparent" variant="dark" fixed="top" expand="lg" className="page-header">
        <Container fluid className="mx-2 mx-sm-5">
          <img
            alt="KUJI logo"
            src={KujiLogo}
            style={{height: "3.6em", paddingRight: "0.8em"}}
          />
          <Navbar.Brand
            style={{fontVariant: "small-caps", fontSize: "1.8em", fontWeight: "bold", paddingLeft: "0.5em"}}
            href="/"
            className="color-white d-none d-md-block"
          >
            Kujira Name System
          </Navbar.Brand>
          <Navbar.Brand
            style={{fontSize: "1.6em", fontWeight: "bold"}}
            href="/"
            className="text-light d-block d-md-none"
          >
            KNS
          </Navbar.Brand>
          <div style={{flexGrow: "1"}}></div>
          <WalletSelect name={walletName} addr={walletAddr}></WalletSelect>
        </Container>
      </Navbar>
      <Container style={{paddingTop: "8rem"}} fluid>
        {children}
      </Container>
      <Container
        style={{
          marginTop: "8rem",
          height: "100%"
        }}
        fluid
        className="p-0">
        <footer style={{height: "8rem"}} className="page-footer">
          <Row className="mx-5 pt-5">
            <Col className="text-center text-grey mx-auto">
              footer content
            </Col>
          </Row>
        </footer>
      </Container>
    </Container>
  )
}

export default Layout
