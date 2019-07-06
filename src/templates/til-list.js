import React from "react"
import { graphql } from "gatsby"

import { blogMapper } from "../utils/common"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Pagination from "../components/pagination"

function TILList(props) {
  console.log(props)
  const { currentPage, numPages, basePath } = props.pageContext
  const prevPage =
    currentPage - 1 === 1 ? `${basePath}` : `/${basePath}/${currentPage - 1}`
  const nextPage = `/${basePath}/${currentPage + 1}`

  const { data } = props
  const posts = data.allMarkdownRemark.edges
  const BlogCards = posts.map(blogMapper)

  return (
    <Layout location={props.location} title={"TIL list"}>
      <SEO title="TIL posts" />
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

export default TILList

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(?=til).*$/" } }
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
          html
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
