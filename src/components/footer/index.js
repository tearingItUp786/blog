import React from "react"
import styled from "styled-components"

const StyledFooter = styled.footer`
  width: 100vw;
  background: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.body};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
`

const GatsbyLink = styled.a`
  color: ${props => props.theme.colors.body};
  font-size: 14px;
  text-align: center;
  flex-basis: 100%;
  display: block;
  transition: color 300ms ease-in-out;

  &:hover,
  &:active {
    color: rebeccapurple;
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

  React.useEffect(() => {
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
