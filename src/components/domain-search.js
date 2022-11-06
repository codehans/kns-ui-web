import * as React from "react"
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form"
import InputGroup from "react-bootstrap/InputGroup"
import DomainDetail from "./domain-detail"

class DomainSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = { searchInput: "", showResults: false }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({ searchInput: event.target.value })
  }

  handleSubmit(event) {
    event.preventDefault()
    if (this.state.searchInput.length < 1) {
      return
    }
    this.setState({ search: this.state.searchInput, showResults: true, searchInput: "" })
  }
  
  render() {
    return (
      <Container fluid>
        <Form onSubmit={this.handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="example.kuji"
              value={this.state.searchInput}
              onChange={this.handleChange}
              className="text-light bg-dark bg-opacity-75 border-grey border-opacity-25"
            />
            <Button variant="outline-primary-light" className="border-opacity-75" type="submit">Search</Button>
          </InputGroup>
        </Form>
        {
          this.state.showResults ?
            <DomainDetail domain={this.state.search} contracts={this.props.contracts}/>
            : <span></span>
        }
      </Container>
    )
  }
}

export default DomainSearch
