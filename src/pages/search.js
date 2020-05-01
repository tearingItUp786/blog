import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Search from "../components/search"

function SearchPage(props) {
  const siteTitle = "foo"

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="All search" />
      <Search lng="en" />
    </Layout>
  )
}

export default SearchPage
