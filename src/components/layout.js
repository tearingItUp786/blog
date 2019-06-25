import React from "react"
import styled from "styled-components"
import { ThemeProvider } from "styled-components"
import { Normalize } from "styled-normalize"

import Header from "./header"
import { lightTheme } from "../utils/styling"
import { GlobalStyle } from "../utils/styling/base-components"
import Hero from "./hero"

const Main = styled.main`
  margin: 2rem auto 4rem;
  max-width: ${props => props.theme.sizing["max-width"]};
  width: ${props => props.theme.sizing.width};
`

function Layout(props) {
  const { children } = props

  return (
    <ThemeProvider theme={lightTheme}>
      <React.Fragment>
        <Normalize />
        <GlobalStyle />
        <Header />
        <Hero />
        <Main>{children}</Main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </React.Fragment>
    </ThemeProvider>
  )
}

export default Layout
