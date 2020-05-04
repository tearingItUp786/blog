import React, { useEffect, useLayoutEffect, useState, useRef } from "react"
import { useStaticQuery, graphql } from "gatsby"

import { useGlobalAppDispatch, useGlobalAppState } from "../global-provider"
import { updateQuery } from "../global-provider/reducer"
import {
  StyledHeader,
  StyledNav,
  LogoContainer,
  StyledLogo,
  LinksContainer,
  StyledNavContainer,
  SearchAndLinksContainer,
} from "./styled-header"
import logoPath from "../../images/logo/logo-black.svg"
import MobileNav from "./mobile"
import { NavLink } from "../../utils/styling/typo"
import useLocation from "../../hooks/use-location"
import Search from "../search"

function Header(props) {
  const { query } = useGlobalAppState()
  const globalDispatch = useGlobalAppDispatch()
  const setQuery = val => updateQuery(globalDispatch, val)
  const [isOpen, updateMenu] = useState(null)
  const [height, setHeight] = useState(0)
  const [isFixed, setFixed] = useState(false)
  const ref = useRef(null)
  const wLoc = useLocation()

  useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight)
      props.updateHeaderHeight(`${ref.current.clientHeight}px`)
    }
  }, [props, ref])

  // on window scroll, lets check to see if the scroll of the window
  // is greater than the height of navbar
  useEffect(() => {
    if (ref && ref.current && ref.current.clientHeight) {
      const val = ref.current.clientHeight || 0
      let onScroll = () => {
        if (window.scrollY > val) {
          if (!isOpen) {
            setFixed(true)
          }
        } else if (window.scrollY < val / 10) {
          if (!isOpen) {
            setFixed(false)
          }
        }
      }
      window.onscroll = onScroll
      return () => {
        onScroll = () => {}
        window.onscroll = onScroll
      }
    }
  }, [isFixed, setFixed, isOpen, ref])

  const { hash } = wLoc.location
  useLayoutEffect(() => {
    if (isOpen) {
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.position = "fixed"
      setFixed(true)
      // isOpen is null on first render -- we don't want this behavior on first render.
    } else if (!isOpen) {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        const elementOffset = el && el.offsetTop
        window.scrollTo(0, elementOffset - 100)
      }
    }
  }, [hash])

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
      <StyledNavContainer isOpen={isOpen} isFixed={isFixed}>
        <StyledNav isFixed={isFixed}>
          <LogoContainer aria-label="Go to twitter page" to="/">
            <StyledLogo
              src={logoPath}
              alt={`${author} Logo`}
              isFixed={isFixed}
            />
          </LogoContainer>
          <MobileNav isOpen={isOpen} updateMenu={updateMenu} />
          <SearchAndLinksContainer>
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
              <NavLink
                aria-label="View Taran's about page"
                to="/about/"
                partiallyActive
                activeClassName="active"
              >
                About
              </NavLink>
            </LinksContainer>
            <Search lng="en" query={query} setQuery={setQuery} />
          </SearchAndLinksContainer>
        </StyledNav>
      </StyledNavContainer>
    </StyledHeader>
  )
}

export default Header
