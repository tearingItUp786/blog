import React from "react"
import { ThemeProvider } from "styled-components"

import { defaultTheme } from "../../utils/styling"
import {
  BlockQuote,
  TextLink,
  ShortQuote,
  SmallAsterisk,
} from "../../utils/styling/typo"

const withThemeProvider = WrappedComponent =>
  class extends React.Component {
    render() {
      return (
        <ThemeProvider theme={defaultTheme}>
          <WrappedComponent {...this.props} />
        </ThemeProvider>
      )
    }
  }

export const MDXBlockQuote = withThemeProvider(BlockQuote)
export const MDXTextLink = withThemeProvider(TextLink)
export const MDXShortQuote = withThemeProvider(ShortQuote)
export const MDXSmallAsterisk = withThemeProvider(SmallAsterisk)
