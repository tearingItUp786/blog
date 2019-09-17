import React from "react"
import styled from "styled-components"
import { ThemeProvider } from "styled-components"
import { Normalize } from "styled-normalize"
import tw from "tailwind.macro"

import { defaultTheme } from "../utils/styling"
import Header from "./header"
import { GlobalStyle } from "../utils/styling/base-components"
import Hero from "./hero"
import Footer from "./footer"

const Main = styled.main`
  width: 1280px;
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
  const { children, location } = props
  const isHome = location.pathname === "/"
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
