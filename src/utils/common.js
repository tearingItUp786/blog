import React from "react"
import BlogCard from "../components/blog-card"

export function blogMapper({ node }) {
  const title = node.frontmatter.title || node.fields.slug
  const description = node.frontmatter.description || node.excerpt
  const tag = node.frontmatter.tag
  console.log(tag)
  return (
    <BlogCard
      key={node.fields.slug}
      slug={node.fields.slug}
      date={node.frontmatter.date}
      description={description}
      title={title}
      tag={tag}
    />
  )
}
