import React, { Component } from "react"
import { Container } from "./styled-comps"
// Search component
export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: ``,
      results: [],
    }
  }

  render() {
    return (
      <Container>
        <input
          placeholder="Search material"
          type="text"
          value={this.state.query}
          onChange={this.search}
        />
        <ul style={{ display: "none" }}>
          {this.state.results.map(page => (
            <>
              <li>{page.title}</li>
              {JSON.stringify(page, null, 4)}
            </>
          ))}
        </ul>
      </Container>
    )
  }

  getSearchResults(query) {
    if (!query || !window.__LUNR__) return []
    const lunrIndex = window.__LUNR__[this.props.lng]
    const results = lunrIndex.index.search(`${query}~1`) // you can  customize your search , see https://lunrjs.com/guides/searching.html
    console.log(results)
    return results.map(({ ref }) => lunrIndex.store[ref])
  }

  search = event => {
    const query = event.target.value
    const results = this.getSearchResults(query)
    this.setState(s => {
      return {
        results,
        query,
      }
    })
  }
}
