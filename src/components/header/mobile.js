import React from "react"
import styled from "styled-components"
import { customMedia } from "../../utils/styling"

const MobileNavContainer = styled.div`
  display: none;

  ${customMedia.lessThan("md")`
    display: block;
  `}
`

const HamburgerButton = styled.button`
  z-index: 30;
  top: -5px;
  position: relative;
  background: transparent;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  color: rgb(255, 255, 255);
  cursor: pointer;
  border-radius: 4px;
  padding: 8px 15px;
  transition: all 200ms ease 0s;
`

const HamburgerLines = styled.div`
  width: 24px;
  height: 2px;
  position: absolute;
  left: 0px;
  background: ${props => (props.isOpen ? "transparent" : "blue")};
  transition: all 250ms cubic-bezier(0.86, 0, 0.07, 1) 0s;

  &::before {
    content: "";
    top: ${props => (props.isOpen ? "0px" : "-8px")};
    width: 24px;
    height: 2px;
    position: absolute;
    left: 0px;
    transform: ${props => (props.isOpen ? "rotate(-45deg)" : "rotate(0deg)")};
    transition: all 250ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
  }

  &::after {
    top: 8px;
    content: "";
    width: 24px;
    height: 2px;
    position: absolute;
    left: 0px;
    transform: ${props => (props.isOpen ? "rotate(45deg)" : "rotate(0deg)")};
    transition: all 250ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
    top: ${props => (props.isOpen ? "0px" : "")};
  }
`

function MobileNav(props) {
  const { isOpen, updateMenu } = props
  return (
    <MobileNavContainer>
      <HamburgerButton onClick={() => updateMenu(!isOpen)} isOpen={isOpen}>
        <HamburgerLines isOpen={isOpen} />
      </HamburgerButton>
    </MobileNavContainer>
  )
}

export default MobileNav
