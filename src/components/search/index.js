import React, { useLayoutEffect } from "react"
import styled, { keyframes } from "styled-components"
import { navigate } from "gatsby"

import SearchInput from "./SearchInput"
import Results from "./Results"
import { customMedia } from "../../utils/styling"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

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
      animation: ${fadeIn} ease-in-out forwards 300ms;
    }
  }

  ${customMedia.greaterThan("md")`
    margin-bottom: 0.2rem;
    margin-right: 0;
  `}
`
export default function Search(props) {
  const { query, setQuery } = props
  const [results, resultsSet] = React.useState([])
  const [highlightIndex, highlightIndexSet] = React.useState(0)
  const [hasFocus, setHasFocus] = React.useState(false)
  const [fromKeyboard, setFromKeyboard] = React.useState(false)
  const sRef = React.useRef(null)
  const containerRef = React.useRef(null)

  useLayoutEffect(() => {
    if (highlightIndex === -1 && sRef.current) sRef.current.focus()
  }, [highlightIndex])

  function getSearchResults(query) {
    if (!query || !window.__LUNR__) return []
    const lunrIndex = window.__LUNR__[props.lng]
    const results = lunrIndex.index.search(`${query}~1`) // you can  customize your search , see https://lunrjs.com/guides/searching.html
    return results.map(({ ref }) => lunrIndex.store[ref])
  }

  function search(event) {
    const val = event.target.value
    const results = getSearchResults(val)
    resultsSet(results)
    setQuery(val)
  }

  function onKeyDown(evt) {
    evt.stopPropagation()
    if (evt.keyCode === 40) {
      evt.preventDefault()

      if (highlightIndex < results.length - 1) {
        highlightIndexSet(highlightIndex + 1)
        setFromKeyboard(true)
      }
    }

    if (evt.keyCode === 38) {
      evt.preventDefault()
      if (highlightIndex <= 0) {
        highlightIndexSet(-1)
        setFromKeyboard(true)
      } else {
        highlightIndexSet(highlightIndex - 1)
        setFromKeyboard(true)
      }
    }

    if (evt.keyCode === 13) {
      evt.preventDefault()
      const { url, type } = results[highlightIndex]
      if (type !== "TIL") navigate(url, {})
      else {
        navigate(`/til#${url}`, {})
      }
    }
  }

  return (
    <SearchContainer
      ref={containerRef}
      onMouseMove={() => setFromKeyboard(false)}
    >
      <SearchInput
        placeholder="Search material"
        type="search"
        value={query}
        onChange={search}
        onFocus={() => {
          setHasFocus(true)
        }}
        onBlur={evt => {
          if (
            containerRef.current &&
            !containerRef.current.contains(evt.relatedTarget)
          ) {
            setHasFocus(false)
          }
          highlightIndexSet(0)
        }}
        onKeyDown={onKeyDown}
        ref={sRef}
      />
      <Results
        highlightIndex={highlightIndex}
        highlightIndexSet={highlightIndexSet}
        results={results}
        showResults={hasFocus}
        fromKeyboard={fromKeyboard}
        setFromKeyboard={setFromKeyboard}
        onCardClick={() => setHasFocus(false)}
      />
    </SearchContainer>
  )
}
