import React, { useEffect, useState, useRef } from "react"
import { useStaticQuery, graphql } from "gatsby"
import {
  StyledHeader,
  StyledNav,
  LogoContainer,
  StyledLogo,
  LinksContainer,
  StyledNavContainer,
} from "./styled-header"
import logoPath from "../../images/logo/logo-black.svg"
import MobileNav from "./mobile"
import { NavLink } from "../../utils/styling/typo"

function Header(props) {
  const [isOpen, updateMenu] = useState(false)
  const [height, setHeight] = useState(0)
  const [isFixed, setFixed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight)
      props.updateHeaderHeight(`${ref.current.clientHeight}px`)
    }
  }, [props])

  // on window scroll, lets check to see if the scroll of the window
  // is greater than the height of navbar
  useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      console.log(document.body.scrollTop, ref.current.clientHeight)
      window.onscroll = () => {
        if (window.scrollY > ref.current.clientHeight / 10) {
          setFixed(true)
        } else {
          setFixed(false)
        }
      }
    }
  }, [isFixed, setFixed])

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
    <StyledHeader ref={ref}>
      <StyledNavContainer isFixed={isFixed}>
        <StyledNav isFixed={isFixed}>
          <LogoContainer aria-label="Go to twitter page" to="/">
            <StyledLogo
              src={logoPath}
              alt={`${author} Logo`}
              isFixed={isFixed}
            />
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
      </StyledNavContainer>
    </StyledHeader>
  )
}

export default Header
