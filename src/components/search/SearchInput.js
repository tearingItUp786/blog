import React from "react"
import { SInput } from "./styled-comps"

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
