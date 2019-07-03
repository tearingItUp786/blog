import { fluidFontSize } from "./helper"

export const lightTheme = {
  colors: {
    body: `#fff`,
    text: `#0d0d0d`,
    accent: `#f5ae00`,
    mainAccent: `#cc0000`,
  },
  font: {
    title: `"Raleway", sans-serif`,
    body: `"Open Sans", sans-serif`,
  },
  fontSizes: {
    h1: fluidFontSize({ minSize: 28, maxSize: 40 }),
    h2: fluidFontSize({ minSize: 24, maxSize: 36 }),
    h3: fluidFontSize({ minSize: 18, maxSize: 24 }),
    h4: fluidFontSize({ minSize: 16, maxSize: 22 }),
    h5: fluidFontSize({ minSize: 16, maxSize: 20 }),
    h6: fluidFontSize({ minSize: 14, maxSize: 16 }),
    body: fluidFontSize({ minSize: 14, maxSize: 16 }),
    code: fluidFontSize({ minSize: 12, maxSize: 14 }),
  },
  sizing: {
    "max-width": "90vw",
    width: "800px",
  },
}
