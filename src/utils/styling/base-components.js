import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=DM+Sans:400,700|DM+Serif+Display|Lora&display=swap');
    body {
        padding: 0;
        margin: 0;
        font-family: ${props =>
          props.theme.fontFamily.display.reduce(
            (acc, val) => `"${acc}", "${val}"`
          )};
    }
`
