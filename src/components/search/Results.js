import React from "react"
import styled from "styled-components"
import ResultCard from "./ResultCard"

const SList = styled.ul`
  list-style-type: none;
  position: absolute;
  padding: 0;
  opacity: 0;
  transition: opacity 300ms;
  background-color: ${props => props.theme.colors.body};
  width: 500px;
  transform: translatex(-100%);
  left: 100%;
  overflow: auto;
  max-height: 500px;
`

function Results({ results }) {
  if (results.length === 0) return null

  return (
    <SList>
      {results.map(page => (
        <ResultCard key={page.title} {...page} />
      ))}
    </SList>
  )
}

export default Results
