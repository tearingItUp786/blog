import tw from "tailwind.macro"
export function marginBottom(val) {
  // if the val is in possible val, call the appropriate tw class
  switch (val) {
    case "0":
      return tw`mb-0`
    case "1":
      return tw`mb-0`
    case "2":
      return tw`mb-2`
    case "3":
      return tw`mb-3`
    case "4":
      return tw`mb-4`
    default:
      return tw`mb-0`
  }
}

export function marginTop(val) {
  // if the val is in possible val, call the appropriate tw class
  switch (val) {
    case "0":
      return tw`mt-0`
    case "1":
      return tw`mt-0`
    case "2":
      return tw`mt-2`
    case "3":
      return tw`mt-3`
    case "4":
      return tw`mt-4`
    default:
      return tw`mt-0`
  }
}
