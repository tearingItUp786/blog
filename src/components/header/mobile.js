import React from "react"

import styled from "styled-components"
import { customMedia } from "../../utils/styling"

const MobileNavContainer = styled.div`
  display: none;
  ${customMedia.lessThan("md")`
    display: block;
    &::before {
      z-index: 10;
      position: absolute;
      border-radius: .5rem;
      left: 0;
      background: ${props => props.theme.colors.body};
      transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
      top: -5vh;
      width: 100vw;
      height: 105vh;
      transform-origin: right top;
      ${props =>
        props.isOpen
          ? "transform: scale(1); opacity: 1"
          : "transform: scale(0); opacity: 0"};
      content: "";
    }
  `}
`

const HamburgerButton = styled.button`
  z-index: 10;
  top: 0;
  position: absolute;
  background: transparent;
  border: none;
  border-width: 0;
  cursor: pointer;
  padding: 1rem;
  color: ${props => props.theme.colors.text};
  transform: translateY(50%);
  right: 5vw;
  border-style: none;
  border-radius: 4px;
`

const HamburgerLines = styled.div`
  position: absolute;
  left: 3px;
  background: ${props =>
    props.isOpen ? "transparent" : props.theme.colors.accent};
  width: 24px;
  height: 2px;
  transition: background 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;

  &::before {
    position: absolute;
    left: 0;
    background: ${props => props.theme.colors.accent};
    content: "";
    top: ${props => (props.isOpen ? "0px" : "-8px")};
    width: 24px;
    height: 2px;
    transform: ${props => (props.isOpen ? "rotate(-45deg)" : "rotate(0deg)")};
    transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
  }

  &::after {
    position: absolute;
    left: 0;
    background: ${props => props.theme.colors.accent};
    top: 8px;
    content: "";
    width: 24px;
    height: 2px;
    transform: ${props => (props.isOpen ? "rotate(45deg)" : "rotate(0deg)")};
    transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
    top: ${props => (props.isOpen ? "0px" : "")};
  }
`

function MobileNav(props) {
  const { isOpen, updateMenu } = props
  return (
    <MobileNavContainer isOpen={isOpen}>
      <HamburgerButton onClick={() => updateMenu(!isOpen)} isOpen={isOpen}>
        <HamburgerLines isOpen={isOpen} />
      </HamburgerButton>
    </MobileNavContainer>
  )
}

export default MobileNav
