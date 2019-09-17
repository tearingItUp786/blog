import styled from "styled-components"
import tw from "tailwind.macro"
import { arrToFontString, arrTransitionCss } from "../helpers"

export const Title = styled.h1`
  ${tw`text-text text-3xl md:text-5xl`};
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
  ${tw`text-accent text-sm`};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const PhotoCaption = styled.figcaption`
  ${tw`text-textLighter text-xs`};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const NavLink = styled.a`
  ${tw`uppercase cursor-pointer tracking-widest text-text text-base `};
  transition: ${arrTransitionCss([{ attr: "color" }])};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
  ${props =>
    props.active
      ? tw`font-bold text-oppBody underline`
      : tw`focus:text-accent hover:text-accent hover:font-bold focus:font-bold`};
`

export default () => NavLink
