import styled, { keyframes, css } from "styled-components"
import search from "./search.svg"
import { customMedia, customMediaObject } from "../../utils/styling"

export const SearchContainer = styled.div`
  margin-left: 1rem;
  position: relative;
`

export const SearchInput = styled.input`
  border: none;
  border-radius: 4px;
  padding: 4px 4px 4px 30px;
  background-image: url(${search});
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position-y: center;
  background-position-x: 4px;
  border: solid 1px white;
  transition: border-color 300ms;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.text};

    & + ul {
      display: ${props => (props.resultsLength ? "flex" : "")};
    }
  }
`

export const SearchList = styled.ul`
  list-style-type: none;
  position: absolute;
  padding: 0;
  display: none;
`
