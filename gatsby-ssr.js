const React = require("react")
const GlobalProvider = require("./src/components/global-provider").default

exports.wrapRootElement = ({ element }) => {
  return <GlobalProvider>{element}</GlobalProvider>
}
