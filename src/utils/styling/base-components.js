import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${props => props.theme.colors.body || "white"};
    font-family: ${props => props.theme.font.body || "sans-serif"};
    font-size: ${props => props.theme.fontSizes.body}
    line-height: 1.5rem;
    color: ${props => props.theme.colors.text || "black"};
    font-weight: 400;
    overflow-y: scroll;
  }

  h1,h2,h3,h4,h5,h6 {
    font-family: ${props => props.theme.font.title || "sans-serif"};
    font-weight: 500;
    letter-spacing: 2px;
  }

  a {
    text-decoration: none;
  }

  code[class*="language-"], 
  pre[class*="language-"] {
    font-size: ${props => props.theme.fontSizes.code}
  }
  
  /**
 * Add back the container background-color, border-radius, padding, margin
 * and overflow that we removed from <pre>.
 */
  .gatsby-highlight {
    background-color: #191919;
    border-radius: 0.3em;
    margin: 0.5em 0;
    padding: 1em;
    overflow: auto;
  }

  .gatsby-highlight-code-line {
    background-color: #b3b3b338
    display: block;
    margin-right: -1em;
    margin-left: -1em;
    padding-right: 1em;
    padding-left: 0.75em;
    border-left: 0.25em solid ${props => props.theme.colors.accent};
  }

  .gatsby-highlight pre[class*="language-"] {
    background-color: transparent;
    margin: 0;
    padding: 0;
    overflow: initial;
    float: left; /* 1 */
    min-width: 100%; /* 2 */
  }
`
