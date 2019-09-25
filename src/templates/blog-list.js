import React from "react"
import { graphql } from "gatsby"

import { blogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Pagination from "../components/pagination"
import { Title } from "../utils/styling/typo"

function BlogList(props) {
  const { currentPage, numPages, basePath } = props.pageContext
  const prevPage =
    currentPage - 1 === 1 ? `${basePath}` : `/${basePath}/${currentPage - 1}`
  const nextPage = `/${basePath}/${currentPage + 1}`

  const { data } = props
  const posts = data.allMarkdownRemark.edges
  const BlogCards = posts.map(blogMapper)

  return (
    <Layout location={props.location} title={"Blog list"}>
      <SEO title="Blog posts" />
      <Title css={"margin-bottom: 0"}>Blog Posts Page: {currentPage}</Title>
      <hr />
      {BlogCards}
      <Pagination
        prevPage={prevPage}
        nextPage={nextPage}
        numPages={numPages}
        currentPage={currentPage}
      />
    </Layout>
  )
}

export default BlogList

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/^((?!til).)*$/" } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
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
