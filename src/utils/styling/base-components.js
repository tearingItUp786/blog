import { createGlobalStyle } from "styled-components"
import { arrToFontString } from "../helpers"
import {
  title2Styles,
  title1Styles,
  title3Styles,
  title4Styles,
  title5Styles,
  paragraphStyles,
} from "./typo"

export const GlobalStyle = createGlobalStyle`
@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-BoldItalic.woff2') format('woff2'),
        url('DMSans-BoldItalic.woff') format('woff');
    font-weight: bold;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-Bold.woff2') format('woff2'),
        url('DMSans-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-MediumItalic.woff2') format('woff2'),
        url('DMSans-MediumItalic.woff') format('woff');
    font-weight: 500;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-Bold.woff2') format('woff2'),
        url('Lora-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'DM Serif Display';
    src: url('DMSerifDisplay-Italic.woff2') format('woff2'),
        url('DMSerifDisplay-Italic.woff') format('woff');
    font-weight: normal;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-BoldItalic.woff2') format('woff2'),
        url('Lora-BoldItalic.woff') format('woff');
    font-weight: bold;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'DM Serif Display';
    src: url('DMSerifDisplay-Regular.woff2') format('woff2'),
        url('DMSerifDisplay-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-Italic.woff2') format('woff2'),
        url('DMSans-Italic.woff') format('woff');
    font-weight: normal;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-Regular.woff2') format('woff2'),
        url('DMSans-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'DM Sans';
    src: url('DMSans-Medium.woff2') format('woff2'),
        url('DMSans-Medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-Italic.woff2') format('woff2'),
        url('Lora-Italic.woff') format('woff');
    font-weight: normal;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-Medium.woff2') format('woff2'),
        url('Lora-Medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-Regular.woff2') format('woff2'),
        url('Lora-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Lora';
    src: url('Lora-MediumItalic.woff2') format('woff2'),
        url('Lora-MediumItalic.woff') format('woff');
    font-weight: 500;
    font-style: italic;
    font-display: swap;
}



    html, body {
      font-weight: 400;
      color: ${(props) => props.theme.colors.text};
      -webkit-overflow-scrolling: touch;
      line-height: 1.625;
      font-family: ${(props) =>
        props.theme.fontFamily.body.reduce(arrToFontString)};
    }

    html {
      background: ${(props) => props.theme.colors.body};
    }
    body {
      overflow: scroll;
      background: ${(props) => props.theme.colors.body};
      color: ${(props) => props.theme.colors.text};
      font-size: 1.125rem;
      padding: 0;
      margin: 0;
      font-family: ${(props) =>
        props.theme.fontFamily.body.reduce(arrToFontString)};
    }
    h1 {
      ${(props) => title1Styles(props)}
    }
    h2 {
      ${(props) => title2Styles({ ...props, noMarginBottom: true })} 
    }
    h3{ 
      ${(props) => title3Styles(props)}
    }
    h4 {
      ${(props) => title4Styles(props)}
    }
    h5 {
      ${(props) => title5Styles({ ...props, marginBottom: "2" })}
    }
    p {
      ${(props) => paragraphStyles(props)};
    }
    hr {
      margin-top: 0;
      border-color: ${(props) => props.theme.colors.text};
      border-style: solid;
    }

    img {
      width: 100%;
    }
    
    a {
      text-decoration: none;
    }

    // These two are for gatsby-remark-autolink-headers:
    a.anchor {
      float: left;
      padding-right: 4px;
      margin-left: -20px;
    }

    a.anchor svg[aria-hidden="true"] {
      stroke: ${(props) => props.theme.colors.accent};
    }

    h1,h2,h3,h4,h5 {
      .anchor svg {
        visibility: hidden;
      }

      &:hover {
        .anchor svg {
          visibility: visible;
        }
      }
    }

    strong {
      color: ${(props) => props.theme.colors.accent};
    }
    
    input { 
      font-size: 1rem;
      font-family: ${(props) =>
        props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
    }

    code[class*="language-"], 
    pre[class*="language-"] {
      font-size: 0.875rem !important;
    }

    .gatsby-highlight-code-line {
      background-color: #b3b3b338;
      display: block;
      margin-right: -1em;
      margin-left: -1em;
      padding-right: 1em;
      padding-left: 0.75em;
      border-left: 0.25em solid ${(props) => props.theme.colors.accent};
    }

    .gatsby-highlight pre[class*="language-"] {
      background-color: transparent;
      margin: 0;
      padding: 0;
      overflow: initial;
      float: left; /* 1 */
      min-width: 100%; /* 2 */
    }
    .gatsby-code-title {
      margin-bottom: -0.6rem;
      padding: 0.5em 1em;
      font-family: Consolas, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
        'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono',
        'Liberation Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier,
        monospace;
    
      background-color: black;
      color: white;
      z-index: 0;
    
      border-top-left-radius: 0.3em;
      border-top-right-radius: 0.3em;
    }
    /**
    * If you only want to use line numbering
    */

    /* Adjust the position of the line numbers */
    .gatsby-highlight pre[class*="language-"].line-numbers {
      padding-left: 2.8em;
    }

    .gatsby-highlight {
      background-color: #191919;
      margin: 0.5em 0;
      padding: 1em;
      overflow: auto;
      border-radius: 0.3em;
    }

    .gatsby-highlight pre[class*="language-"].line-numbers {
      padding: 0;
      padding-left: 2.8em;
      overflow: initial;
    }

    .gatsby-code-title + .gatsby-highlight {
      border-radius: 0;
    }
`
