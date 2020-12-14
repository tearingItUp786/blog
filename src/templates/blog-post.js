import React from "react"
import { graphql } from "gatsby"
import MDXRenderer from "gatsby-plugin-mdx/mdx-renderer"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Pagination from "../components/pagination"
import { Title, Title3, DateAndAuth } from "../utils/styling/typo"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    const prevPage = previous ? previous.fields.slug : null
    const prevText = previous ? previous.frontmatter.title : null

    const nextPage = next ? next.fields.slug : null
    const nextText = next ? next.frontmatter.title : null

    const splitTitle = post.frontmatter.title.split('\\n').map(v => <React.Fragment key={v}>{v}<br /></React.Fragment>)

    return (
      <Layout>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <Title center marginBottom="1">
          { splitTitle }
        </Title>
        <Title3 center noMarginTop noMarginBottom>
          {post.frontmatter.subtitle}
        </Title3>
        <DateAndAuth center marginTop="1">
          Taran "tearing it up" Bains • {post.frontmatter.date}
        </DateAndAuth>
        <MDXRenderer>{post.body}</MDXRenderer>
        {previous || next ? <hr /> : null}
        <Pagination
          prevPage={prevPage}
          prevText={prevText}
          nextPage={nextPage}
          nextText={nextText}
        />
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        subtitle
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
