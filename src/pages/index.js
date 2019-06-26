import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import BlogCard from "../components/blog-card"

function blogMapper({ node }) {
  const title = node.frontmatter.title || node.fields.slug
  const description = node.frontmatter.description || node.excerpt

  return (
    <BlogCard
      key={node.fields.slug}
      slug={node.fields.slug}
      date={node.frontmatter.date}
      description={description}
      title={title}
    />
  )
}

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
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
          }
        }
      }
    }
  }
`
