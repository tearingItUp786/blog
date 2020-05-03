import React, { Component } from "react"
import styled from "styled-components"

import SearchInput from "./SearchInput"
import Results from "./Results"
import { customMedia } from "../../utils/styling"

// Search component
export const SearchContainer = styled.div`
  margin-left: 1rem;
  position: relative;
  margin-right: 3rem;
  margin-bottom: 0.7rem;

  &:focus-within {
    > input {
      outline: none;
      border-color: ${props => props.theme.colors.text};
    }

    > ul {
      opacity: ${props => (props.resultsLength ? "1" : "0")};
    }
  }

  ${customMedia.greaterThan("md")`
    margin-bottom: 0.2rem;
    margin-right: 0;
  `}
`
export default class Search extends Component {
  state = {
    query: ``,
    results: [],
  }
  render() {
    const { query, results } = this.state
    return (
      <SearchContainer resultsLength={results.length}>
        <SearchInput
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
