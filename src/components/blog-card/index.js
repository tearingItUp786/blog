import React from "react"
import styled from "styled-components"
import { fluidFontSize } from "../../utils/styling/helper"
const CardContainer = styled.article`
  width: 100%;
  margin-bottom: 48px;

  &:last-of-type {
    margin-bottom: 0;
  }
`

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.h3};
  font-weight: 700;
  margin-bottom: 8px;
  margin-top: 8px;

  a {
    color: ${props => props.theme.colors.accent};
  }
`

const PostInfo = styled.p`
  font-family: ${props => props.theme.font.title};
  font-size: ${fluidFontSize({ minSize: 12, maxSize: 14 })};
  font-weight: 300;
  margin-top: 0;
  margin-bottom: 0;
`

const PostIntro = styled.p`
  margin-top: 8px;
`

const PostTag = styled.span`
  margin-left: 8px;
`

const TitleLink = props => {
  if (props.slug === null) {
    return <span>{props.title}</span>
  } else {
    return (
      <a aria-label={`Go to ${props.slug} blog post`} href={props.slug}>
        {props.title}
      </a>
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
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : null

  return (
    <CardContainer>
      <Title>
        <TitleLink slug={slug} title={title} />
      </Title>
      <PostInfo>
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
