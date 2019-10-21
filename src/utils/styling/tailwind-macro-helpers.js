export function marginBottom(val) {
  // if the val is in possible val, call the appropriate tw class
  switch (val) {
    case "0":
      return { marginBottom: 0 }
    case "1":
      return { marginBottom: 0 }
    case "2":
      return { marginBottom: "0.5rem" }
    case "3":
      return { marginBottom: "0.75rem" }
    case "4":
      return { marginBottom: "1rem" }
    default:
      return { marginBottom: 0 }
  }
}

export function marginTop(val) {
  // if the val is in possible val, call the appropriate tw class
  switch (val) {
    case "0":
      return { marginTop: 0 }
    case "1":
      return { marginTop: 0 }
    case "2":
      return { marginTop: "0.5rem" }
    case "3":
      return { marginTop: "0.75rem" }
    case "4":
      return { marginTop: "1rem" }
    default:
      return { marginTop: 0 }
  }
}
