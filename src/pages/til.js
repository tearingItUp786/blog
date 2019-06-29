import React from "react"
import { graphql } from "gatsby"

import { blogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"

function TIL(props) {
  const { data } = props
  const posts = data.allMarkdownRemark.edges
  const TILCards = posts.map(blogMapper)

  return (
    <Layout location={props.location} title="A list of my TILS">
      <SEO title="Blog posts" />
      {TILCards}
    </Layout>
  )
}

export default TIL

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(?=til).*$/" } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tag
          }
        }
      }
    }
  }
`
