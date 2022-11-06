import * as React from "react"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const Denom = ({amount, base, display, exponent = 6, decimals = 2}) => {
  const normalized = (amount / (10 ** exponent)).toFixed(decimals)

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip>{amount}{base}</Tooltip>}
    >
      <span>{normalized} <span className="text-grey">{display}</span></span>
    </OverlayTrigger>
  )
}

export default Denom