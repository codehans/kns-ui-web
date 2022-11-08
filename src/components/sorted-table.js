import * as React from "react"
import Table from "react-bootstrap/Table"
import { FaSortDown, FaSortUp } from "react-icons/fa"
import isEqual from "lodash/isEqual"

class SortedTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortIndex: [...Array(this.props.data.length).keys()],
      sortCol: 0,
      sortReverse: false,
    }
    if (this.props.sort) {
      const sortCol = this.props.sortDefault ? this.props.sortDefault : 0
      const sortIndex = this.getSortIndex(this.state.sortIndex, sortCol)
      this.state = { sortIndex: sortIndex, sortCol: sortCol, sortReverse: false }
    }
    this.getCellContent = this.getCellContent.bind(this)
    this.getCellStyle = this.getCellStyle.bind(this)
    this.getRowStyle = this.getRowStyle.bind(this)
    this.getSortIndex = this.getSortIndex.bind(this)
    this.handleSort = this.handleSort.bind(this)
  }

  getCellContent(entry, i, row) {
    const display = this.props.view[i] ? this.props.view[i](entry) : entry
    return this.props.rowLinks ?
      <a href={this.props.rowLinks(row)} className="text-reset text-decoration-none d-block">
        {display}
      </a>
      : display
  }

  getCellPadding(i) {  // remove gaps between cells for row links
    if (i === 0) {
      return "pe-0"
    } else if (i === (this.props.headers.length - 1)) {
      return "ps-0"
    } else {
      return "pe-0 ps-0"
    }
  }

  getRowStyle(row) {
    return this.props.rowStyles ?
      typeof this.props.rowStyles == "string" ?
        this.props.rowStyles
        : this.props.rowStyles(row)
      : ""
  }

  getCellStyle(cellIndex) {
    return this.props.styles && this.props.styles.length > cellIndex ?
      this.props.styles[cellIndex]
      : ""
  }

  getSortIndex(index, sortCol) {
    return [...index]
      .sort((x, y) => {
        const dx = this.props.data[x][sortCol]
        const dy = this.props.data[y][sortCol]
        return this.props.sort[sortCol] ?
          this.props.sort[sortCol](dx, dy)
          : dx - dy
      })
  }

  handleSort(event, sortCol) {
    if (this.state.sortCol === sortCol) {
      this.setState({ sortReverse: !this.state.sortReverse })
    } else {
      this.setState({
        sortCol: sortCol,
        sortIndex: this.getSortIndex(this.state.sortIndex, sortCol),
        sortReverse: false,
      })
    }
  }

  componentDidUpdate(prev) {
    if (!isEqual(this.props.data, prev.data)) {
      const sortCol = this.state.sortCol
      this.setState({
        sortCol: sortCol,
        sortIndex: this.getSortIndex(Array(this.props.data.length).keys(), sortCol),
        sortReverse: this.state.sortReverse,
      })
    }
  }
  
  render() {
    return (
      <Table variant="grey" size="sm" borderless striped hover>
        <thead className="text-muted">
          <tr>
          {
            this.props.headers.map((header, i) => 
              <td className={[this.getCellStyle(i), this.getCellPadding(i)].join(" ")}>
                <span
                  style={{cursor: "pointer", userSelect: "none"}}
                  onClick={(e) => this.handleSort(e, i)}
                  onKeyPress={(e) => { if (e.key === "Enter") {this.handleSort(e, i)} }}
                  role="button"
                  tabIndex={0}
                >
                  {typeof header == "string" ? header : header()}&nbsp;
                  <span style={{position: "relative", width: "1em"}}>
                    <FaSortUp
                      style={{position: "absolute", marginTop: "0.25em"}}
                      className={this.state.sortCol === i && this.state.sortReverse ? "text-secondary" : "text-muted"}
                    />
                    <FaSortDown
                      style={{position: "absolute", marginTop: "0.23em"}}
                      className={this.state.sortCol === i && !this.state.sortReverse ? "text-secondary" : "text-muted"}
                    />
                    <span>&nbsp;&nbsp;&nbsp;</span>
                  </span>
                </span>
              </td>
            )
          }
          </tr>
        </thead>
        <tbody className="text-light">
        {
          [...Array(this.props.data.length).keys()]
            .map(i => {
              if (this.state.sortReverse) {
                return this.props.data[this.state.sortIndex[this.state.sortIndex.length - i - 1]]
              } else {
                return this.props.data[this.state.sortIndex[i]]
              }
            })
            .map(row => !row ? false :
              <tr>
              {
                row.map((entry, i) =>
                  <td className={
                    [this.getRowStyle(row), this.getCellStyle(i), this.getCellPadding(i)].join(" ")
                  }>
                    <span className={this.getCellStyle(i)}>{this.getCellContent(entry, i, row)}</span>
                  </td>
                )
              }
              </tr>
          )
        }
        </tbody>
      </Table>
    )
  }
}

export default SortedTable