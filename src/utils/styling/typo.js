import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import tw from "tailwind.macro"
import { arrToFontString, arrTransitionCss } from "../helpers"
import { marginBottom, marginTop } from "./tailwind-macro-helpers"

function commonProps(props) {
  const ret = [
    props.center ? tw`text-center` : null,
    props.noMarginBottom ? tw`mb-0` : null,
    props.noMarginTop ? tw`mt-0` : null,
    props.noVertMargin ? tw`my-0` : null,
    props.marginBottom ? marginBottom(props.marginBottom) : null,
    props.marginTop ? marginTop(props.marginTop) : null,
  ].reduce((acc, val) => {
    let newAcc = { ...acc, ...val }

    return newAcc
  }, {})

  return ret
}

export const title1Styles = props => ({
  ...tw`text-3xl md:text-5xl`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.display.reduce(arrToFontString),
})

export const title2Styles = props => ({
  ...tw`text-text text-3xl md:text-4xl`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.display.reduce(arrToFontString),
})

export const title3Styles = props => ({
  ...tw`text-textLight text-2xl font-normal`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const title4Styles = props => ({
  ...tw`text-oppBody text-xl font-medium`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const title5Styles = props => ({
  ...tw`text-xl text-text font-medium`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const paragraphStyles = props => ({
  ...tw`text-text text-lg`,
  ...commonProps(props),
  fontFamily: props.theme.fontFamily.body.reduce(arrToFontString),
})

export const Title = styled.h1`
  ${props => title1Styles(props)};
`
export const Title2 = styled.h2`
  ${props => title2Styles(props)}
`

export const Title3 = styled.h3`
  ${props => title3Styles(props)}
`
export const Title4 = styled.h4`
  ${props => title4Styles(props)}
`

export const Title5 = styled.h5`
  ${props => title5Styles(props)}
`

export const Paragraph = styled.p`
  ${props => paragraphStyles(props)}
`

export const TextLink = styled.a`
  ${tw`text-accent text-lg underline`}
  ${props => commonProps(props)}
  font-family: ${props => props.theme.fontFamily.body.reduce(arrToFontString)};
`
export const DateAndAuth = styled.p`
  ${tw`text-sm`};
  ${props => (props.inverse ? tw`text-oppBody` : tw`text-accent`)};
  ${props => commonProps(props)}
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const PhotoCaption = styled.figcaption`
  ${tw`text-textLighter text-xs`};
  ${props => commonProps(props)}
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`

export const BlockQuote = styled.blockquote`
  ${props => title2Styles(props)}
  ${tw`border-l-4 border-r-0 border-t-0 border-b-0 border-solid pl-2 my-16`};
  border-color: ${props => props.theme.colors.accent};
`

export const ShortQuote = styled.blockquote`
  ${tw`text-3xl md:text-4xl my-16 pt-8 italic`};
  font-family: ${props =>
    props.theme.fontFamily.display.reduce(arrToFontString)};

  span {
    ${tw`block text-center`}
    font-size: 8rem;
    line-height: 0;
    color: ${props => props.theme.colors.accent};
  }
`

export const NavLink = styled(({ hideDesktop, ...restProps }) => (
  <Link {...restProps} />
))`
  ${tw`w-full py-2 md:py-0 text-center md:w-auto md:ml-4 no-underline uppercase cursor-pointer tracking-widest text-text text-base `};
  ${tw`focus:text-accent hover:text-accent hover:font-bold focus:font-bold`};
  ${props => commonProps(props)}
  ${props => (props.hideDesktop ? tw`hidden` : tw`inline-block`)};
  transition: ${arrTransitionCss([{ attr: "color" }])};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};

  &.active {
    ${tw`font-bold text-oppBody underline`};
  }
`

export default () => Title
