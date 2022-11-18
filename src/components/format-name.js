import * as React from "react"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const FormatName = ({children, len = 16}) => {
  if (!children || typeof children != "string") {
    return <span></span>
  }
  if (children.length <= len) {
    return <span>{children}</span>
  } else {
    const display = [
        children.slice(0, 6),
        "...",
        children.slice(children.length - 6),
    ].reduce((x, y) => x.concat(y))
    return (
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{children}</Tooltip>}>
        <span>{display}</span>
      </OverlayTrigger>
    )
  }
}

export default FormatName