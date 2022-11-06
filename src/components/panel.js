import * as React from "react"
import Card from 'react-bootstrap/Card'

const Panel = ({title, children}) => {
  return (
    <Card bg="grey" className="bg-opacity-10 mb-3">
      <Card.Title style={{fontSize: "1.6rem"}} className="text-grey p-3 mb-1">{title}</Card.Title>
      <Card.Body className="pt-0 ps-5 pe-5">
        {children}
      </Card.Body>
    </Card>
  )
}

export default Panel