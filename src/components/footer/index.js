import React, { useEffect } from "react"
import tw from "tailwind.macro"
import styled from "styled-components"

const StyledFooter = styled.footer`
  ${tw`w-full justify-center py-4`};
`

const GatsbyLink = styled.a`
  ${tw`text-base text-text text-center block mx-auto hover:text-accent`};
  max-width: 90vw;
  width: 400px;
  transition: color 300ms ease-in-out;
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
