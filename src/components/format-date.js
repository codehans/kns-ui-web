import * as React from "react"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { IntlProvider, FormattedDate, FormattedTime } from "react-intl"

const FormatDate = ({children, time=false}) => {
  const date = new Date(Number(children) * 1000)

  return (
    <IntlProvider defaultLocale="en" locale={navigator.language}>
      <OverlayTrigger placement="bottom" overlay={
        <Tooltip>
          <FormattedTime value={date} hour="numeric" minute="2-digit" year="numeric" month="long" day="numeric" hour12={false}/>
        </Tooltip>
      }>
        <span>
          
          {
            time ?
              <FormattedTime value={date} hour="numeric" minute="2-digit" month="numeric" day="numeric" hour12={true}/>
              : <FormattedDate value={date} year="2-digit" month="numeric" day="numeric"/>
          }
          
        </span>
      </OverlayTrigger>
    </IntlProvider>
  )
}

export default FormatDate