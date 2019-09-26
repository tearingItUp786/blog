import React from "react"
import styled from "styled-components"
import tw from "tailwind.macro"
import MDXRenderer from "gatsby-plugin-mdx/mdx-renderer"

import { Title2, DateAndAuth, Paragraph } from "../../utils/styling/typo"
const CardContainer = styled.article`
  width: 100%;
  margin-bottom: 48px;

  &:last-of-type {
    margin-bottom: 0;
  }
`

const Title = styled(Title2)`
  ${tw`mb-4`};
`

const PostInfo = DateAndAuth

const PostIntro = styled(Paragraph)``

const PostTag = styled.span`
  margin-left: 8px;
`

const Anchor = styled(Title2)`
  ${tw`text-accent no-underline`};
`

const TitleLink = props => {
  if (props.slug === null) {
    return <span>{props.title}</span>
  } else {
    return (
      <Anchor
        as="a"
        aria-label={`Go to ${props.slug} blog post`}
        href={props.slug}
      >
        {props.title}
      </Anchor>
    )
  }
}

function BlogCard(props) {
  const {
    title = "No Title",
    slug = "No Slug",
    date = "No Date",
    description = "No Desc",
    tag = "",
    html = null,
  } = props

  const postTag = tag ? (
    <PostTag>
      {" "}
      <span role="img" aria-label="tag emoji!">
        🏷️
      </span>{" "}
      ️{tag}
    </PostTag>
  ) : null

  const contentSection = description ? (
    <PostIntro>{description}</PostIntro>
  ) : html ? (
    <MDXRenderer>{html}</MDXRenderer>
  ) : null

  return (
    <CardContainer>
      <Title>
        <TitleLink slug={slug} title={title} />
      </Title>
      <PostInfo inverse={true}>
        <span role="img" aria-label="calendar emoji!">
          🗓️
        </span>{" "}
        {date} {postTag}
      </PostInfo>
      {contentSection}
    </CardContainer>
  )
}

export default BlogCard
