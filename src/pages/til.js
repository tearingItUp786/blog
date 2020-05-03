import React from "react"
import { graphql } from "gatsby"

import { BlogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Title } from "../utils/styling/typo"

function TIL(props) {
  const { data } = props
  const posts = data.allMdx.edges
  const BlogCards = posts.map(({ node }) => (
    <BlogMapper key={node.fields.slug} node={node} />
  ))

  return (
    <Layout location={props.location} title={"TIL list"}>
      <SEO title="Today I Learned posts" />
      <Title css={"margin-bottom: 0"}>Today I Learned:</Title>
      <hr />
      {BlogCards}
    </Layout>
  )
}

export default TIL

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      filter: { fileAbsolutePath: { regex: "/(?=til).*$/" } }
      sort: { fields: [frontmatter___date], order: DESC }
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
            tag
          }
        }
      }
    }
  }
`
