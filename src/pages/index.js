import React from "react"
import { graphql } from "gatsby"

import { blogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"

function BlogIndex(props) {
  const { data } = props
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const BlogCards = posts.map(blogMapper)

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="All posts" />
      {BlogCards}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 6
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
