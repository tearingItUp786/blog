import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Title, TextLink } from "../utils/styling/typo"
import { BlogMapper } from "../utils/common"

function TagList(props) {
  const {
    data,
    pageContext: { tag },
  } = props
  const posts = data.allMdx.edges
  const Cards = posts.map(({ node }) => (
    <BlogMapper key={node.fields.slug} node={node} />
  ))

  return (
    <Layout>
      <SEO title={`List of blog posts/til for ${tag}`} />
      <Title marginBottom="0">{tag}</Title>
      <hr />
      <TextLink target="_self" href="/tags/">
        Back to Tags
      </TextLink>
      {Cards}
    </Layout>
  )
}

export default TagList

export const pageQuery = graphql`
  query TagListPageQuery($tagQuery: String!) {
    allMdx(filter: { frontmatter: { tag: { regex: $tagQuery } } }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          body
          frontmatter {
            description
            date(formatString: "MMMM DD, YYYY")
            title
            tag
          }
        }
      }
    }
  }
`
