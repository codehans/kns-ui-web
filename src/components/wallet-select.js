import * as React from "react"
import Button from "react-bootstrap/Button"
import { FaWallet } from "react-icons/fa"

const WalletSelect = ({name, addr}) => {
  if (!name) {
    return <Button variant="outline-primary" className="text-primary">
      CONNECT WALLET
    </Button>
  }
  return <Button variant="outline-primary" className="text-light">
    <FaWallet style={{width: "1em", marginBottom: "0.1em"}} className="text-grey me-2"/> {name}
  </Button>
}

export default WalletSelect