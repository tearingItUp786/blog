import React, { useEffect } from "react"
import styled from "styled-components"

const StyledFooter = styled.footer`
  width: 100%;
  padding-top: 1rem;
  justify-content: center;
`

const GatsbyLink = styled.a`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  text-align: center;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 90vw;
  width: 400px;
  transition: color 300ms ease-in-out;

  &:hover {
    color: ${props => props.theme.colors.accent};
  }
`
const TwitterLink = styled(GatsbyLink)`
  &:hover,
  &:active {
    color: #1da1f2;
  }
`

function Footer(props) {
  const ref = React.useRef(null)

  useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      props.updateFooterHeight(`${ref.current.clientHeight}px`)
    }
  }, [props])

  return (
    <StyledFooter ref={ref}>
      <GatsbyLink
        target="_blank"
        aria-label="Go to gatsby site"
        href="https://www.gatsbyjs.org/"
      >
        © {new Date().getFullYear()}, Built with Gatsby
      </GatsbyLink>
      <TwitterLink
        target="_blank"
        href="https://twitter.com/tearingitup786?lang=en"
        aria-label="Follow me on Twitter Link"
      >
        Follow me on Twitter!
      </TwitterLink>
    </StyledFooter>
  )
}

export default Footer
