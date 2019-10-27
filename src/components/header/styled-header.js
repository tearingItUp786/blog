import { Link } from "gatsby"
import styled, { keyframes, css } from "styled-components"

import { customMedia, customMediaObject } from "../../utils/styling"

export const StyledHeader = styled.header`
  margin-left: auto;
  margin-right: auto;
  padding-left: 0;
  padding-right: 0;
  display: flex;
  align-items: center;
  width: 100%;
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
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  z-index: 10;
  background: ${props => (props.isFixed ? "white" : "transparent")};
  ${props =>
    props.isFixed
      ? {
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 10,
          opacity: 0,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }
      : { position: "relative", marginLeft: "auto", marginRight: "auto" }};
  animation: ${props =>
    props.isFixed
      ? css`
          ${translateTop} 300ms ease-in forwards 300ms
        `
      : ``};

  ${customMedia.lessThan("md")`
      position: ${props => (props.isOpen && !props.isFixed ? "fixed" : "")};
    `}
`

export const StyledNav = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-left: auto;
  margin-right: auto;
  transition: width 100ms ease 400ms;
  width: calc(${customMediaObject.xl} * 0.66);
  max-width: 90vw;
  padding: ${props => (props.isFixed ? "0" : "0.5rem 0")};
  ${customMedia.lessThan("md")`
    flex-wrap: nowrap;
    max-width: calc(100vw - 10vw);
    padding: 0 5vw;
  `};
`

export const LogoContainer = styled(Link)`
  z-index: 20;
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
  display: block;
  ${customMedia.lessThan("md")`
    opacity: 0;
    z-index: 10;
    position: absolute;
    left: 0;
    width: 100%;
    background: transparent;
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
