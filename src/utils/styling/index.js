import { createGlobalStyle } from "styled-components"
import { defaultBreakpoints } from "styled-media-query"

export const lightTheme = {
  colors: {
    body: `#fff`,
    text: `#0d0d0d`,
    accent: `#f5ae00`,
    mainAccent: `#cc0000`,
  },
  font: {
    title: `"Raleway", sans-serif`,
    body: `"Open Sans", sans-serif`,
  },
  sizing: {
    "max-width": "90vw",
    width: "800px",
  },
}

// take the breakpoint strings given to us by the styled media query
// and for each key, strip out the px
export const breakpointNumbers = Object.keys(defaultBreakpoints).reduce(
  (acc, cur) => {
    return {
      ...acc,
      [cur]: defaultBreakpoints[cur].split("px")[0],
    }
  },
  {}
)

export const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${props => props.theme.colors.body || "white"};
    font-family: ${props => props.theme.font.body || "sans-serif"};
    color: ${props => props.theme.colors.text || "black"};
  }
`
