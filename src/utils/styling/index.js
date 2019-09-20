import { generateMedia } from "styled-media-query"
// based on tailwind base
export const customMediaObject = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
}
export const customMedia = generateMedia(customMediaObject)

export const defaultTheme = {
  colors: {
    body: "#ffffff",
    oppBody: "#000000",
    text: `#1c1b19`,
    textLight: `#666666`,
    textLighter: `#949494`,
    accent: `#f410a1`,
    transparent: "transparent",
  },
  fontFamily: {
    display: ["DM Serif Display", "serif"],
    displaySecondary: ["DM Sans", "sans-serif"],
    body: ["Lora", "serif"],
  },
}
