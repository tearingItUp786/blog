// custom typefaces
import React from "react"
import GlobalProvider from "./src/components/global-provider"
import "@fontsource/dm-sans"
import "@fontsource/dm-serif-display"
import "@fontsource/lora"

import "prismjs/themes/prism-okaidia.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"
export const wrapRootElement = ({ element }) => {
  return <GlobalProvider> {element} </GlobalProvider>
}
