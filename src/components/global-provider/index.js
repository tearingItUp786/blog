import React from "react"
import reducer from "./reducer"

const GlobalAppStateContext = React.createContext()
const GlobalAppDispatchContext = React.createContext()
const initialState = {
  query: "",
  visitedHome: false,
}

const init = (initialState) => {
  const globalState = window?.sessionStorage.getItem("globalState")
  if (!globalState) return initialState
  else return JSON.parse(globalState)
}

export default function GlobalProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState, init)

  React.useEffect(() => {
    if (window.sessionStorage)
      window.sessionStorage.setItem("globalState", JSON.stringify(state))
  }, [state])

  return (
    <GlobalAppStateContext.Provider value={state}>
      <GlobalAppDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalAppDispatchContext.Provider>
    </GlobalAppStateContext.Provider>
  )
}

export function useGlobalAppState() {
  const context = React.useContext(GlobalAppStateContext)
  if (context === undefined) {
    throw new Error("useGlobalAppState must be used with a GlobalProvider")
  }

  return context
}

export function useGlobalAppDispatch() {
  const context = React.useContext(GlobalAppDispatchContext)
  if (context === undefined) {
    throw new Error("useGlobalAppDispatch must be used with GlobalProvider")
  }

  return context
}
