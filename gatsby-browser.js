// custom typefaces
import React from "react"
import GlobalProvider from "./src/components/global-provider"
import "@fontsource/lora/700.css"
import "@fontsource/lora/400.css"
import "@fontsource/dm-sans"
import "@fontsource/dm-serif-display"
import "prismjs/themes/prism-okaidia.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"
export const wrapRootElement = ({ element }) => {
  return <GlobalProvider> {element} </GlobalProvider>
}
