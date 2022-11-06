import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/montserrat'

import '../styles/theme.scss'
import KujiLogo from '../images/logo.svg'
import WalletSelect from './wallet-select.js'

const Layout = ({walletName, walletAddr, children}) => {
  return (
    <Container
      fluid
      style={{
        background: "#22242f",
        fontFamily: "Montserrat, Fira Sans, sans-serif",
        height: "100%",
        minHeight: "100vh",
        padding: "0px",
      }}
    >
      <Navbar style={{minHeight: "8rem"}} bg="dark" variant="dark" fixed="top" expand="lg" className="bg-opacity-75">
        <Container>
          <img src={KujiLogo} style={{height: "3.6em", paddingRight: "1em"}} className="d-none d-sm-block"/>
          <Navbar.Brand
            style={{fontVariant: "small-caps", fontSize: "1.6em", fontWeight: "bold", paddingLeft: "0.5em"}}
            href="/"
            className="text-primary d-none d-md-block"
          >
            Kujira Name System
          </Navbar.Brand>
          <Navbar.Brand
            style={{fontSize: "1.6em", fontWeight: "bold", paddingLeft: "0.2em"}}
            href="/"
            className="text-primary d-block d-md-none"
          >
            KNS
          </Navbar.Brand>
          <div style={{flexGrow: "1"}}></div>
          <WalletSelect name={walletName} addr={walletAddr}></WalletSelect>
        </Container>
      </Navbar>
      <Container style={{paddingTop: "10rem",}}>
        {children}
      </Container>
      <Container
        style={{
          marginTop: "6rem",
          position: "fixed",
          bottom: "0"
        }}
        fluid
        className="p-0">
        <footer style={{height: "6rem"}} className="bg-dark bg-opacity-75">
          <Row className="mx-5 pt-4">
            <Col className="text-center mx-auto">
              footer content
            </Col>
          </Row>
        </footer>
      </Container>
    </Container>
  )
}

export default Layout
