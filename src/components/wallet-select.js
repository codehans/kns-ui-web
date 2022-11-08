import * as React from "react"
import Button from "react-bootstrap/Button"
import { FaUser, FaWallet } from "react-icons/fa"

import FormatName from "../components/format-name"

const iconStyle = {width: "1em", marginBottom: "0.1em"}

const WalletSelect = ({name, addr}) => {
  if (!name) {
    return <Button variant="outline-primary">
      <FaWallet style={iconStyle} className="text-grey me-2"/>&nbsp;
      CONNECT WALLET
    </Button>
  }
  return <Button variant="outline-primary">
    <span className="text-light">
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