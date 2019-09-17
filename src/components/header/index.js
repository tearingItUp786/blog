import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import {
  StyledHeader,
  StyledNav,
  LogoContainer,
  StyledLogo,
  LinksContainer,
} from "./styled-header"
import logoPath from "../../images/logo/logo-black.svg"
import MobileNav from "./mobile"
import { NavLink } from "../../utils/styling/typo"

function Header(props) {
  const [isOpen, updateMenu] = React.useState(false)
  const [height, setHeight] = React.useState(0)
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight)
      props.updateHeaderHeight(`${ref.current.clientHeight}px`)
    }
  }, [props])

  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata

  return (
    <StyledHeader ref={ref} main={props.main}>
      <StyledNav>
        <LogoContainer aria-label="Go to twitter page" to="/">
          <StyledLogo src={logoPath} alt={`${author} Logo`} />
        </LogoContainer>
        <MobileNav isOpen={isOpen} updateMenu={updateMenu} />
        <LinksContainer isOpen={isOpen} offsetTop={height - 1}>
          <NavLink
            aria-label="Go back to home page"
            to="/"
            activeClassName="active"
            hideDesktop={true}
          >
            Home
          </NavLink>
          <NavLink
            aria-label="View Blog Posts"
            partiallyActive
            to="/blog/"
            activeClassName="active"
          >
            Blog
          </NavLink>
          <NavLink
            aria-label="View today I learned page"
            to="/til/"
            partiallyActive
            activeClassName="active"
          >
            TIL
          </NavLink>
        </LinksContainer>
      </StyledNav>
    </StyledHeader>
  )
}

export default Header
