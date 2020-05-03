import React from "react"
import styled from "styled-components"
import search from "./search.svg"

const SInput = styled.input`
  border: solid 1px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px 4px 4px 30px;
  background-image: url(${search});
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position-y: center;
  background-position-x: 4px;
  transition: border-color 300ms;
`

function SearchInput({ onChange, resultsLength, placeholder, value }) {
  return (
    <SInput
      onChange={onChange}
      resultsLength={resultsLength}
      placeholder={placeholder}
      value={value}
    />
  )
}

export default SearchInput
