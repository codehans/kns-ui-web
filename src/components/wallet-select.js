import * as React from 'react'
import Button from "react-bootstrap/Button"
import { Link } from "react-feather"

const WalletSelect = ({name, addr}) => {
  if (!name) {
    return <Button variant="outline-primary" className="text-primary">
      CONNECT WALLET
    </Button>
  }
  return <Button variant="outline-primary" className="text-light">
    {name} <Link style={{width: "1em"}} className="text-grey ms-2"/>
  </Button>
}

export default WalletSelect