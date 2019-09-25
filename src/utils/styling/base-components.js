import tw from "tailwind.macro"
import { createGlobalStyle } from "styled-components"
import { arrToFontString } from "../helpers"

export const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=DM+Sans:400,700|DM+Serif+Display|Lora&display=swap');
    
    html, body {
      ${tw`font-regular text-text scrolling-touch leading-relaxed`};
      font-family: ${props =>
        props.theme.fontFamily.body.reduce(arrToFontString)};
    }

    html {
      background: ${props => props.theme.colors.body};
    }
    body {
      ${tw`overflow-scroll bg-body text-text text-lg`};
      padding: 0;
      margin: 0;
      font-family: ${props =>
        props.theme.fontFamily.body.reduce(arrToFontString)};
    }

    hr {
      margin-top: 16px;
      border-color: ${props => props.theme.colors.text};
      border-style: solid;
    }

    code[class*="language-"], 
    pre[class*="language-"] {
      ${tw`text-sm`};
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
