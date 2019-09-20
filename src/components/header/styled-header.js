import { Link } from "gatsby"
import styled, { keyframes, css } from "styled-components"
import tw from "tailwind.macro"
import { customMedia, customMediaObject } from "../../utils/styling"

export const StyledHeader = styled.header`
  ${tw`mx-auto`};
  width: 1280px;
  max-width: 90vw;
  min-height: 90px;
`

export const StyledLogo = styled.img`
  transition: transform 300ms ease-in-out;
  border-radius: 50%;
  width: 65px;
  transform: ${props => (props.isFixed ? "scale(.6)" : "scale(1)")};
`

const translateTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`
export const StyledNavContainer = styled.div`
  ${tw`mx-auto`};
  width: ${props => (props.isFixed ? "100vw" : "100%")};
  background: ${props => (props.isFixed ? "white" : "transparent")};
  ${props =>
    props.isFixed ? tw`fixed left-0 z-10 opacity-0` : tw`relative mx-auto`};
  animation: ${props =>
    props.isFixed
      ? css`
          ${translateTop} 300ms ease-in forwards 200ms
        `
      : ``};
`

export const StyledNav = styled.nav`
  ${tw`relative flex items-center justify-between flex-wrap mx-auto`};
  width: ${props => (props.isFixed ? customMediaObject.xl : "100%")};
  max-width: 90vw;
  ${props => {
    return props.isFixed ? tw`py-0 px-0` : tw`relative py-2`
  }}
  ${customMedia.lessThan("md")`
    ${tw`flex-no-wrap`}
  `};
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

  ${customMedia.lessThan("md")`
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
