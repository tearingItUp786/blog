/**
 * Just some functional helpers that can help make the code look cleaner
 * Can write some unit tests for these too when I want 😁
 */
// TODO: write unit test
export const arrToFontString = (acc, val) => `"${acc}", "${val}"`

// TODO: write unit test
export const transitionCss = (
  { ms = 300, attr = "opacity", delay = 0 } = {
    ms: 300,
    attr: "opacity",
    delay: 0,
  }
) => `${ms}ms ${attr} ${delay}ms`

// TODO: write unit test
/**
 *
 * @param {[{ms, attr, delay}]} arrOfTrans
 * @returns {string}
 */
export const arrTransitionCss = arrOfTrans => {
  if (arrOfTrans.length === 0) {
    return ""
  }

  return arrOfTrans
    .reduce((acc, val) => {
      // base case of just 1 item in the array;
      if (arrOfTrans.length === 1) {
        return transitionCss(val)
      }

      // the first case where it's the empty string
      if (acc === "") {
        return `${transitionCss(val)}`
      }

      return `${acc}, ${transitionCss(val)}`
    }, "")
    .trim()
}
