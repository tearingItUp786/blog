import React from "react"

export default function useFocusOnSlash(sRef) {
  React.useEffect(() => {
    const { current } = sRef
    const handler = (evt) => {
      if (
        evt.key === "/" &&
        !document.activeElement?.getAttribute("contenteditable") &&
        document.activeElement?.tagName !== "input" &&
        document.activeElement !== current
      ) {
        evt.preventDefault()
        evt.stopPropagation()
        current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [sRef])
}
