import React from "react"
import styled from "styled-components"
import { ThemeProvider } from "styled-components"
import { Normalize } from "styled-normalize"

import { defaultTheme, customMediaObject } from "../utils/styling"
import { GlobalStyle } from "../utils/styling/base-components"
import Header from "./header"
import Hero from "./hero"
import Footer from "./footer"
import useLocation from "../hooks/use-location"

const Main = styled.main`
  width: calc(${customMediaObject.xl} * 0.66);
  max-width: 90vw;
  margin: 2rem auto 4rem;
  min-height: ${props =>
    props.isHome
      ? "auto"
      : `calc(
    100vh - ${props.headerHeight} - ${props.footerHeight} -
      5.75rem
  )`};
`

const ContentContainer = styled.div`
  outline: none;
  display: flex;
  flex-wrap: wrap;
  position: relative;
`

function Layout(props) {
  const [headerHeight, updateHeaderHeight] = React.useState("0px")
  const [footerHeight, updateFooterHeight] = React.useState("0px")
  const { children, isHome } = props
  const hero = isHome ? <Hero /> : null

  return (
    <ThemeProvider theme={defaultTheme}>
      <ContentContainer>
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
      </ContentContainer>
    </ThemeProvider>
  )
}

export default Layout
