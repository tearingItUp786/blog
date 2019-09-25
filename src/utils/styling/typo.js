import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import tw from "tailwind.macro"
import { arrToFontString, arrTransitionCss } from "../helpers"

export const Title = styled.h1`
  ${tw`text-3xl md:text-5xl`};
  ${props => (props.pink ? tw`text-accent` : tw`text-text`)};
  font-family: ${props =>
    props.theme.fontFamily.display.reduce(arrToFontString)};
`
export const Title2 = styled.h2`
  ${tw`text-text text-3xl md:text-4xl`};
  font-family: ${props =>
    props.theme.fontFamily.display.reduce(arrToFontString)};
`

export const Title3 = styled.h3`
  ${tw`text-textLight text-2xl`};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const Title4 = styled.h4`
  ${tw`text-oppBody text-xl font-medium`};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const Paragraph = styled.p`
  ${tw`text-text text-lg`};
  font-family: ${props => props.theme.fontFamily.body.reduce(arrToFontString)};
`

export const TextLink = styled.a`
  ${tw`text-accent text-lg underline`}
  font-family: ${props => props.theme.fontFamily.body.reduce(arrToFontString)};
`
export const DateAndAuth = styled.p`
  ${tw`text-sm`};
  ${props => (props.inverse ? tw`text-oppBody` : tw`text-accent`)};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const PhotoCaption = styled.figcaption`
  ${tw`text-textLighter text-xs`};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const NavLink = styled(({ hideDesktop, ...restProps }) => (
  <Link {...restProps} />
))`
  ${tw`w-full py-2 md:py-0 text-center md:w-auto md:ml-4 no-underline uppercase cursor-pointer tracking-widest text-text text-base `};
  ${tw`focus:text-accent hover:text-accent hover:font-bold focus:font-bold`};
  ${props => (props.hideDesktop ? tw`hidden` : tw`inline-block`)};
  transition: ${arrTransitionCss([{ attr: "color" }])};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};

  &.active {
    ${tw`font-bold text-oppBody underline`};
  }
`

export default () => Title
