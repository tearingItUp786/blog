import React from "react"
import Helmet from "react-helmet"
import GlobalStyle from "../global-style"
import useSiteMetadata from "../hooks/use-sitemetadata"

function Layout({ children }) {
  const { title, description } = useSiteMetadata()

  return (
    <React.Fragment>
      <GlobalStyle />
      <Helmet>
        <Helmet>
          <html lang="en" />
          <title>{title}</title>
          <meta name="description" content={description} />
        </Helmet>
      </Helmet>
      <main>{children}</main>
    </React.Fragment>
  )
}

export default Layout
