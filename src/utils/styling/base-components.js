import styled, { createGlobalStyle } from "styled-components"
import { fluidFontSize } from "./helper"

export const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${props => props.theme.colors.body || "white"};
    font-family: ${props => props.theme.font.body || "sans-serif"};
    color: ${props => props.theme.colors.text || "black"};
  }

  h1,h2,h3,h4,h5,h6 {
    font-family: ${props => props.theme.font.title || "sans-serif"};
    font-weight: 300;
    letter-spacing: 2px;
  }
`
export const H3 = styled.h3`
  font-size: ${fluidFontSize({ minSize: 18, maxSize: 28 })};
  color: ${props => props.theme.colors.body};
`
