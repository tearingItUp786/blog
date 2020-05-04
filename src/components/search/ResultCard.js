import React, { useRef, useLayoutEffect, useState } from "react"
import { Link } from "gatsby"
import styled from "styled-components"

const Card = styled.li`
  transition: background 300ms;
  pointer-events: ${props =>
    props.allowClick && !props.isCurrent ? "auto" : "none"};
  &:focus {
    outline: 0;
  }
  a:focus {
    outline: 0;
  }
  background-color: ${props => props.highlighted && "rgba(0,0,0, .2)"};
  background-color: ${props => props.isCurrent && "rgba(28, 27, 25, .8);"};
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
  color: ${props =>
    props.isCurrent ? props.theme.colors.body : props.theme.colors.textLight};
`

const Excerpt = styled.p`
  margin: 0;
  border-left: solid 1px ${props => props.theme.colors.accent};
  padding-left: 0.5rem;
  font-size: 1rem;
  line-height: 1.15rem;
  flex-basis: 80%;
  color: ${props => props.isCurrent && props.theme.colors.body};
`

function ResultCard({
  type,
  title,
  url,
  excerpt,
  highlighted,
  fromKeyboard,
  ...rest
}) {
  const ref = useRef(null)
  const [cur, setCur] = useState(false)
  useLayoutEffect(() => {
    if (highlighted && ref.current && fromKeyboard) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [highlighted, fromKeyboard])
  const href = type === "TIL" ? `/til/#${url}` : url
  return (
    <Card
      ref={ref}
      highlighted={highlighted}
      isCurrent={cur}
      allowClick={!fromKeyboard}
      {...rest}
    >
      <Link
        tabIndex={-1}
        to={href}
        aria-label={`Go to ${url} ${type} post`}
        getProps={lProps => {
          setCur(lProps.isCurrent)
        }}
      >
        <Title>{title}</Title>
        <ContentContainer>
          <Type isCurrent={cur}>{type}</Type>
          <Excerpt isCurrent={cur}>{excerpt}</Excerpt>
        </ContentContainer>
      </Link>
    </Card>
  )
}

export default ResultCard
