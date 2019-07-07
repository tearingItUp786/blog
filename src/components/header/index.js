import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import {
  StyledHeader,
  StyledNav,
  AvatarContainer,
  StyledAvatar,
  Name,
  LinksContainer,
  NavLink,
} from "./styled-header"
import MobileNav from "./mobile"

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
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
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

  const { author, social } = data.site.siteMetadata

  return (
    <StyledHeader ref={ref} main={props.main}>
      <StyledNav>
        <AvatarContainer aria-label="Go to twitter page" to="/">
          <StyledAvatar
            fixed={data.avatar.childImageSharp.fixed}
            alt={author}
          />
          <Name>{social.twitter}</Name>
        </AvatarContainer>
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
