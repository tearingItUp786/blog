import React from "react"
import styled from "styled-components"
import { ThemeProvider } from "styled-components"
import { Normalize } from "styled-normalize"

import Header from "./header"
import { lightTheme } from "../utils/styling"
import { GlobalStyle } from "../utils/styling/base-components"
import Hero from "./hero"
import Footer from "./footer"

const Main = styled.main`
  margin: 2rem auto 4rem;
  min-height: ${props =>
    props.isHome
      ? "auto"
      : `calc(
    100vh - ${props.headerHeight} - ${props.footerHeight} -
      6rem
  )`};
  max-width: ${props => props.theme.sizing["max-width"]};
  width: ${props => props.theme.sizing.width};
`

function Layout(props) {
  const [headerHeight, updateHeaderHeight] = React.useState("0px")
  const [footerHeight, updateFooterHeight] = React.useState("0px")
  const { children, location } = props
  const isHome = location.pathname === "/"
  const hero = isHome ? <Hero /> : null

  return (
    <ThemeProvider theme={lightTheme}>
      <React.Fragment>
        <Normalize />
        <GlobalStyle />
        <Header main={isHome} updateHeaderHeight={updateHeaderHeight} />
        {hero}
        <Main
          isHome={isHome}
          headerHeight={headerHeight}
          footerHeight={footerHeight}
        >
          {children}
        </Main>
        <Footer updateFooterHeight={updateFooterHeight} />
      </React.Fragment>
    </ThemeProvider>
  )
}

export default Layout
