import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${props => props.theme.colors.body || "white"};
    font-family: ${props => props.theme.font.body || "sans-serif"};
    font-size: ${props => props.theme.fontSizes.body}
    line-height: 1.5rem;
    color: ${props => props.theme.colors.text || "black"};
    font-weight: 400;
  }

  h1,h2,h3,h4,h5,h6 {
    font-family: ${props => props.theme.font.title || "sans-serif"};
    font-weight: 500;
    letter-spacing: 2px;
  }

  a {
    text-decoration: none;
  }
  

`
