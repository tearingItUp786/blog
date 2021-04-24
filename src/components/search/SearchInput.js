import React from "react"
import styled from "styled-components"

const SInput = styled.input`
  border: solid 1px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px 4px 4px 12px;
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position-y: center;
  background-position-x: 4px;
  transition: border-color 300ms;

  &::-webkit-search-decoration:hover,
  &::-webkit-search-cancel-button:hover {
    cursor: pointer;
  }

  &:focus-within,
  &:focus {
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button {
      display: block;
    }
  }

  &:hover:not(:focus) {
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button {
      display: none;
    }
  }
`

const Slash = styled.span`
  display: ${(props) => (props.hidden ? "none" : "inline-block")};
  position: absolute;
  right: 8px;
  padding: 4px;
  font-size: 14px;
  line-height: 9px;
  top: 50%;
  transform: translateY(-45%);
  border: solid 1px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.4);
`

const SearchInput = React.forwardRef(
  (
    { onChange, resultsLength, placeholder, value, hideSlash, ...rest },
    ref
  ) => {
    return (
      <>
        <SInput
          {...rest}
          id="global-search"
          ref={ref}
          onChange={onChange}
          resultsLength={resultsLength}
          placeholder={placeholder}
          value={value}
        />
        <Slash hidden={hideSlash}>⁄</Slash>
      </>
    )
  }
)

export default SearchInput
