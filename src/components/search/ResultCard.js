import React from "react"
import styled from "styled-components"

const Card = styled.li`
  transition: background 300ms;
  &:hover,
  &:focus-within {
    background: rgba(28, 27, 25, 0.1);
  }
`

const Title = styled.h5`
  margin: 0;
  background: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.body};
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  text-transform: uppercase;
  font-size: 1.15rem;
`
const ContentContainer = styled.aside`
  display: flex;
  padding: 1rem 0.5rem;
`

const Type = styled.span`
  display: block;
  text-align: right;
  padding-right: 1rem;
  color: ${props => props.theme.colors.textLight};
`

const Excerpt = styled.p`
  margin: 0;
  border-left: solid 1px ${props => props.theme.colors.accent};
  padding-left: 0.5rem;
  font-size: 1rem;
  line-height: 1.15rem;
  flex-basis: 80%;
`

function ResultCard({ type, title, url, excerpt }) {
  const href = type === "TIL" ? `/til/#${url}` : url
  return (
    <Card>
      <a href={href} aria-label={`Go to ${url} ${type} post`}>
        <Title>{title}</Title>
        <ContentContainer>
          <Type>{type}</Type>
          <Excerpt>{excerpt}</Excerpt>
        </ContentContainer>
      </a>
    </Card>
  )
}

export default ResultCard
