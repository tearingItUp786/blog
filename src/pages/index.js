import React from "react"
import { graphql } from "gatsby"

import { BlogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"

function BlogIndex(props) {
  const { data } = props
  const posts = data.allMdx.edges
  const BlogCards = posts.map(({ node }) => (
    <BlogMapper key={node.fields.slug} node={node} />
  ))

  return (
    <Layout isHome>
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
    allMdx(
      filter: { fileAbsolutePath: { regex: "/^((?!til).)*$/" } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 6
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          body
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
