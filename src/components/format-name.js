import * as React from "react"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import GraphemeSplitter from "grapheme-splitter"

const splitter = new GraphemeSplitter()

const FormatName = ({children, len = 16}) => {
  if (!children || typeof children != "string") {
    return <span></span>
  }
  const chars = splitter.splitGraphemes(children)
  if (chars.length <= len) {
    return <span>{children}</span>
  } else {
    const display = [
        chars.slice(0, 6),
        "...",
        chars.slice(chars.length - 6),
    ].flat(1).reduce((x, y) => x.concat(y))
    return (
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{children}</Tooltip>}>
        <span>{display}</span>
      </OverlayTrigger>
    )
  }
}

export default FormatName