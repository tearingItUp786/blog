import React, { Component } from "react"
import { SearchContainer, SearchList } from "./styled-comps"
import SearchInput from "./SearchInput"
import Results from "./Results"
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
    const { query, results } = this.state
    return (
      <SearchContainer>
        <SearchInput
          resultsLength={results.length}
          placeholder="Search material"
          type="search"
          value={query}
          onChange={this.search}
        />
        <Results results={results} />
      </SearchContainer>
    )
  }

  getSearchResults(query) {
    if (!query || !window.__LUNR__) return []
    const lunrIndex = window.__LUNR__[this.props.lng]
    const results = lunrIndex.index.search(`${query}~1`) // you can  customize your search , see https://lunrjs.com/guides/searching.html
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
