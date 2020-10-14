import React from "react"
import BlogCard from "../components/blog-card"

export function BlogMapper({ node }) {
  const title = node.frontmatter.title || node.fields.slug
  const html = node.body || null
  const description = node.frontmatter.description || null
  const tag = node.frontmatter.tag
  const key = node.fields ? node.fields.slug : title
  const slug = node.fields.slug
  // if it is a valid url, it will have a slash
  const id = node.fields.slug[0] !== "/"

  return (
    <BlogCard
      key={key}
      slug={slug}
      date={node.frontmatter.date}
      description={description}
      title={title}
      tag={tag}
      html={html}
      id={id}
    />
  )
}
