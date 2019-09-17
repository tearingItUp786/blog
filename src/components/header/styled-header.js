import React from "react"
import { Link } from "gatsby"
import styled, { keyframes, css } from "styled-components"
import tw from "tailwind.macro"
import media from "styled-media-query"

export const StyledHeader = styled.header`
  ${tw`mx-auto`};
  width: 1280px;
  max-width: 90vw;
`

export const StyledLogo = styled.img`
  border-radius: 50%;
  width: 65px;
`

export const StyledNav = styled.nav`
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  flex-wrap: wrap;

  ${media.lessThan("medium")`
    flex-wrap: no-wrap;
  `}
`

export const LogoContainer = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`

export const Name = styled.span`
  display: block;
  font-size: 14px;
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
