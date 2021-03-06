import React from "react"
import styled, { keyframes } from "styled-components"
import { navigate } from "gatsby"

import SearchInput from "./SearchInput"
import Results from "./Results"
import { customMedia } from "../../utils/styling"
import useLunr from "../../hooks/use-lunr"
import useFocusOnSlash from "../../hooks/use-focusOnSlash"

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
  margin-bottom: 0;

  &:focus-within {
    > input {
      outline: none;
      border-color: ${(props) => props.theme.colors.text};
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

const ErrorMessage = styled.div`
  position: absolute;
  width: 200px;
  right: 0;
  background: #ec0000;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  text-transform: uppercase;
  font-family: "DM Sans", "sans-serif";
  margin-top: 18px;

  @media (min-width: 768px) {
    width: 500px;
  }
`

export default function Search(props) {
  const { query, setQuery, lng } = props
  const { results, error } = useLunr({ query, lng })
  const [highlightIndex, highlightIndexSet] = React.useState(0)
  const [hasFocus, setHasFocus] = React.useState(false)
  const [fromKeyboard, setFromKeyboard] = React.useState(false)
  const sRef = React.useRef(null)
  const containerRef = React.useRef(null)
  useFocusOnSlash(sRef)

  React.useLayoutEffect(() => {
    if (highlightIndex === -1 && sRef.current) sRef.current.focus()
  }, [highlightIndex])

  function search(event) {
    const val = event.target.value
    highlightIndexSet(0)
    setQuery(val)
  }

  function onKeyDown(evt) {
    evt.stopPropagation()
    // down key
    if (evt.keyCode === 40) {
      evt.preventDefault()
      if (highlightIndex < results.length - 1) {
        highlightIndexSet(highlightIndex + 1)
        setFromKeyboard(true)
      }
    }

    // up key
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

    // enter
    if (evt.keyCode === 13 && results.length && !error) {
      evt.preventDefault()
      sRef.current?.blur()
      const { url, type } = results[highlightIndex]

      type !== "TIL" ? navigate(url, {}) : navigate(`/til#${url}`, {})
    }
  }

  return (
    <SearchContainer
      ref={containerRef}
      onMouseMove={() => setFromKeyboard(false)}
    >
      <SearchInput
        hideSlash={hasFocus}
        placeholder="Search material..."
        type="search"
        value={query}
        onChange={search}
        onFocus={() => {
          setHasFocus(true)
        }}
        onBlur={(evt) => {
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
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </SearchContainer>
  )
}
