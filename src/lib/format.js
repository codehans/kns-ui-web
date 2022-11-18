import * as React from "react"

import Denom from "../components/denom"
import FormatDate from "../components/format-date"
import FormatName from "../components/format-name"
import { denomBase, denomDisplay, denomExponent } from "./vars"

const formatDateShort = x => <FormatDate>{x}</FormatDate>

const formatDateTimeShort = x => <FormatDate time={true}>{x}</FormatDate>

const formatDenom = x => <Denom amount={x} base={denomBase} display={denomDisplay} exponent={denomExponent}/>

const formatName = x => <FormatName>{x}</FormatName>

const formatNameDomainModalTrigger = setDomain => x => <span
    onClick={() => setDomain(x)}
    onKeyUp={(e) => { if (e.key === "Enter") { setDomain(x) }}}
    style={{cursor: "pointer"}}
    role="button"
    tabIndex="0"
>
  {formatName(x)}
</span>

export { formatDateShort, formatDateTimeShort, formatDenom, formatName, formatNameDomainModalTrigger }