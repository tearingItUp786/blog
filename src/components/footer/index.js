import React from "react"
import styled from "styled-components"

const StyledFooter = styled.footer`
  width: 100vw;
  background: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.body};
  display: flex;
  align-items: center;
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
      © {new Date().getFullYear()}, Built with
      {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </StyledFooter>
  )
}

export default Footer
