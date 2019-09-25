import { Link } from "gatsby"
import styled, { keyframes, css } from "styled-components"
import tw from "tailwind.macro"
import { customMedia, customMediaObject } from "../../utils/styling"

export const StyledHeader = styled.header`
  ${tw`mx-auto px-0 flex items-center`};
  width: 1280px;
  max-width: 100vw;
  min-height: 90px;
  ${customMedia.greaterThan("md")`
    max-width: 90vw;
    padding: 0 5vw;
  `}
`

export const StyledLogo = styled.img`
  transition: transform 300ms ease-in-out;
  width: 65px;
  transform: ${props =>
    props.isFixed ? "scale(.6) translateX(-35%)" : "scale(1)"};
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
  ${tw`mx-auto w-full z-10`};
  background: ${props => (props.isFixed ? "white" : "transparent")};
  ${props =>
    props.isFixed
      ? tw`fixed left-0 top-0 z-10 opacity-0 shadow`
      : tw`relative mx-auto`};
  animation: ${props =>
    props.isFixed
      ? css`
          ${translateTop} 300ms ease-in forwards
        `
      : ``};

  ${customMedia.lessThan("md")`
      position: ${props => (props.isOpen && !props.isFixed ? "fixed" : "")};
    `}
`

export const StyledNav = styled.nav`
  ${tw`relative flex items-center justify-between flex-wrap mx-auto`};
  transition: width 100ms ease 400ms;
  width: ${props =>
    props.isFixed ? `calc(${customMediaObject.xl} * 0.66)` : "100%"};
  max-width: 90vw;
  ${props => {
    return props.isFixed ? tw`py-0 px-0` : tw`relative py-2`
  }}
  ${customMedia.lessThan("md")`
    ${tw`flex-no-wrap`}
    max-width: calc(100vw - 10vw);
    padding: 0 5vw;
  `};
`

export const LogoContainer = styled(Link)`
  ${tw`z-20`};
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
`

export const LinksContainer = styled.div`
  ${tw`block`};

  ${customMedia.lessThan("md")`
    ${tw`opacity-0 z-10 absolute left-0 w-full bg-transparent`};
    transform: translateY(-300px);
    top: ${props => (props.offsetTop ? `${props.offsetTop}px` : 0)};
    animation: ${props =>
      props.isOpen
        ? css`
            ${fadeIn} 300ms ease-in-out forwards 300ms
          `
        : css`
            ${fadeOut} 300ms ease-in-out forwards
          `};
    padding-bottom: 30px;
`}
`
