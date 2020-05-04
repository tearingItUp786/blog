// custom typefaces
import React from "react"
import GlobalProvider from "./src/components/global-provider"
import "prismjs/themes/prism-okaidia.css"

export const wrapRootElement = ({ element }) => {
  return <GlobalProvider> {element} </GlobalProvider>
}
