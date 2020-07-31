import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import { customMedia } from "../../utils/styling"
import { arrToFontString, arrTransitionCss } from "../helpers"
import { marginBottom, marginTop } from "./tailwind-macro-helpers"
// const tw = () => {}

function commonProps(props) {
  const ret = [
    props.center ? { textAlign: "center" } : null,
    props.noMarginBottom ? { marginBottom: 0 } : null,
    props.noMarginTop ? { marginTop: 0 } : null,
    props.noVertMargin ? { marginTop: 0, marginBottom: 0 } : null,
    props.marginBottom ? marginBottom(props.marginBottom) : null,
    props.marginTop ? marginTop(props.marginTop) : null,
  ].reduce((acc, val) => {
    let newAcc = { ...acc, ...val }

    return newAcc
  }, {})

  return ret
}

export const title1Styles = props => ({
  ...commonProps(props),
  fontSize: "1.875rem",
  "@media (min-width: 768px)": {
    fontSize: "3rem",
  },
  fontFamily: props.theme.fontFamily.display.reduce(arrToFontString),
})

export const title2Styles = props => ({
  ...commonProps(props),
  color: props.theme.colors.text,
  fontSize: "1.875rem",
  "@media (min-width: 768px)": {
    fontSize: "2.25rem",
  },
  fontFamily: props.theme.fontFamily.display.reduce(arrToFontString),
})

export const title3Styles = props => ({
  ...commonProps(props),
  color: props.theme.colors.textLight,
  fontSize: "1.5rem",
  fontWeight: 400,
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const title4Styles = props => ({
  ...commonProps(props),
  color: props.theme.colors.oppBody,
  fontSize: "1.25rem",
  fontWeight: 500,
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const title5Styles = props => ({
  ...commonProps(props),
  fontSize: "1.25rem",
  color: props.theme.colors.text,
  fontWeight: 500,
  fontFamily: props.theme.fontFamily.displaySecondary.reduce(arrToFontString),
})

export const paragraphStyles = props => ({
  ...commonProps(props),
  color: props.theme.colors.text,
  fontSize: "1.125rem",
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

export const TextLink = styled.a.attrs(props => ({
  target: "blank",
}))`
  ${props => commonProps(props)}
  color: ${props => props.theme.colors.accent};
  font-size: ${props => (props.small ? ".875rem" : "1.125rem")};
  text-decoration: underline;
  font-family: ${props => props.theme.fontFamily.body.reduce(arrToFontString)};
`
export const DateAndAuth = styled.p`
  font-size: .875rem;
  color: ${props =>
    props.inverse ? props.theme.colors.oppBody : props.theme.colors.accent};
  ${props => commonProps(props)}
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`
export const PhotoCaption = styled.figcaption`
  ${props => commonProps(props)}
  color: ${props => props.theme.colors.textLighter};
  font-size: .75rem;
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};
`

export const BlockQuote = styled.blockquote`
  ${props => title2Styles(props)}
  border-left-width: 4px;
  border-right-width: 0;
  border-top-width: 0;
  border-bottom-width: 0;
  border-style: solid;
  padding-left: 0.5rem;
  margin-top: 4rem;
  margin-bottom: 4rem;
  border-color: ${props => props.theme.colors.accent};
`

const ShortQuoteInternal = styled.blockquote`
  font-size: 1.875rem;
  margin-top: 4rem;
  margin-bottom: 4rem;
  padding-top: 2rem;
  font-style: italic;
  font-family: ${props =>
    props.theme.fontFamily.display.reduce(arrToFontString)};

  ${customMedia.lessThan("md")`
      font-size: 2rem;
    `};

  span {
    display: block;
    text-align: center;
    font-size: 8rem;
    line-height: 0;
    color: ${props => props.theme.colors.accent};
  }
`

export const ShortQuote = ({ children, quote, ...rest }) => (
  <ShortQuoteInternal {...rest}>
    {quote ? <span>“</span> : null}
    {children}
  </ShortQuoteInternal>
)

export const SmallAsterisk = styled.span`
  font-size: 0.875rem;
`

export const NavLink = styled(({ hideDesktop, ...restProps }) => (
  <Link {...restProps} />
))`

   width: 100%;
   padding-top: 0.5rem;
   padding-bottom: 0.5rem;
   text-align: center;
   text-decoration: none;
   text-transform: uppercase;
   cursor: pointer;
   color: ${props => props.theme.colors.text};
   font-size: 1rem;
   &:focus, &:hover {
     color: ${props => props.theme.colors.accent};
     font-weight: 700;
   }
   display: ${props => (props.hideDesktop ? "none" : "inline-block")};
  ${props => commonProps(props)}
  transition: ${arrTransitionCss([{ attr: "color" }])};
  font-family: ${props =>
    props.theme.fontFamily.displaySecondary.reduce(arrToFontString)};

  ${customMedia.greaterThan("md")`
    padding-top: 0;
    padding-bottom: 0;
    width: auto;
    margin-left: 1rem;
  `}

  &.active {
    font-weight: 700;
    color: ${props => props.theme.colors.oppBody};
    text-decoration: underline;
  }
`

export default () => Title
