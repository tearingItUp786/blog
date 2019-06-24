import { Link } from "gatsby"
import styled from "styled-components"
import Image from "gatsby-image"
import media, { defaultBreakpoints } from "styled-media-query"
import { fluidFontSize } from "../../utils/styling/helper"

export const StyledHeader = styled.header`
  background-color: ${props => props.theme.colors.text || "black"};
`

export const StyledAvatar = styled(Image)`
  border-radius: 50%;
`

export const StyledNav = styled.nav`
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: ${props => props.theme.sizing["max-width"]};
  width: ${props => props.theme.sizing.width};
  padding: 15px 0;
  flex-wrap: wrap;

  ${media.lessThan("medium")`
    flex-wrap: no-wrap;
  `}
`

export const NavLink = styled(Link)`
  color: ${props => props.theme.colors.body};
  font-weight: ${props => props.fontWeight || "normal"};
  text-decoration: none;
  font-family: ${props => props.theme.font.title || "serif"};
  letter-spacing: 2px;
  font-size: ${fluidFontSize({ minSize: 16, maxSize: 18 })};
  padding: 10px;
  margin-left: ${props => props.marginLeft || 0};
  transition: background-color 300ms ease;
  border-radius: 2px;
  position: relative;
  font-weight: 200;

  &.active {
    &:after {
      background: ${props => props.theme.colors.accent};
      transform: translateX(0);
      opacity: 1;
    }
  }

  &:hover,
  &:focus {
    &:after {
      transform: translateX(0);
      opacity: 1;
    }
  }

  &:after {
    position: absolute;
    transition: transform 300ms ease, opacity 300ms ease;
    width: calc(100% - 20px);
    transform: translateX(-100%);
    opacity: 0;
    content: "";
    height: 1px;
    bottom: 2px;
    color: white;
    background: ${props => props.theme.colors.accent};
    margin: 0 auto;
    left: 0;
    right: 0;

    ${media.lessThan("medium")`
      width: 100px;
      bottom: 15px;
    `}
  }

  ${media.lessThan("medium")`
    width: calc(100% - 30px);
    display: block;
    text-align: center;
    margin-left: 0;
    padding: 30px;
  `}
`

export const AvatarContainer = styled.a`
  text-decoration: none;
  display: flex;
  align-items: center;
`

export const Name = styled.span`
  display: block;
  font-family: ${props => props.theme.font.title};
  font-weight: 200;
  color: ${props => props.theme.colors.body};
  font-size: ${fluidFontSize({ minSize: 16, maxSize: 18 })};
  font-weight: 300;
  margin-left: 10px;
  letter-spacing: 0.5px;

  ${media.lessThan("small")`
    display: none;

  `}
`

export const LinksContainer = styled.div`
  display: block;
  transition: transform 300ms ease;

  ${media.lessThan("medium")`
  z-index: 29;
  background: ${props => props.theme.colors.text}
  position: absolute;
  top: ${props => (props.offsetTop ? `${props.offsetTop}px` : 0)};
  left: 0;
  transform: ${props =>
    props.isOpen ? "translateX(0)" : "translateX(-1000px)"};
    visibility: ${props => (props.isOpen ? "visible" : "hidden")}
  width: 100%
  padding-bottom: 30px;
`}
`
