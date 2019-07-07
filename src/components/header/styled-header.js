import React from "react"
import { Link } from "gatsby"
import styled, { keyframes, css } from "styled-components"
import Image from "gatsby-image"
import media from "styled-media-query"
import { fluidFontSize } from "../../utils/styling/helper"

export const StyledHeader = styled.header`
  background: ${props => props.theme.colors.text};
  width: 100vw;

  ${media.greaterThan("medium")`
    background: ${props =>
      props.main ? "transparent" : props.theme.colors.text};
    position: ${props => (props.main ? "absolute" : "relative")};
    width: 100vw;
    z-index: 5;
  `}
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

export const NavLink = styled(({ marginLeft, hideDesktop, ...restProps }) => (
  <Link {...restProps} />
))`
  color: ${props => props.theme.colors.body};
  display: ${props => (props.hideDesktop ? "none" : "inline-block")};
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
    height: 2px;
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

  & + {
    margin-left: 10px;
  }
`

export const AvatarContainer = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`

export const Name = styled.span`
  display: block;
  font-family: ${props => props.theme.font.title};
  color: ${props => props.theme.colors.body};
  font-size: ${fluidFontSize({ minSize: 16, maxSize: 18 })};
  font-weight: 400;
  margin-left: 16px;
  letter-spacing: 0.5px;
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-1000px);
    visibility: hidden;
  }

  to {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
  }
`

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
    visibility: hidden;
  }

  to {
    opacity: 0;
    transform: translateX(-1000px);
    visibility: hidden;
  }
`

export const LinksContainer = styled.div`
  display: block;

  ${media.lessThan("medium")`
    opacity: 0;
    z-index: 29;
    background: ${props => props.theme.colors.text}
    position: absolute;
    top: ${props => (props.offsetTop ? `${props.offsetTop}px` : 0)};
    left: 0;
    animation: ${props =>
      props.isOpen
        ? css`
            ${slideIn} 300ms ease-in-out forwards
          `
        : css`
            ${slideOut} 300ms ease-in-out forwards
          `};
    width: 100%
    padding-bottom: 30px;
`}
`
