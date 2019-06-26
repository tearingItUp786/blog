import { defaultBreakpoints } from "styled-media-query"

const breakpointNumbers = Object.keys(defaultBreakpoints).reduce((acc, cur) => {
  return {
    ...acc,
    [cur]: defaultBreakpoints[cur].split("px")[0],
  }
}, {})

export function fluidFontSize(
  {
    minSize = 14,
    maxSize = 16,
    minVw = breakpointNumbers.small,
    maxVW = breakpointNumbers.huge,
  } = {
    minSize: 14,
    maxSize: 16,
    minVw: breakpointNumbers.small,
    maxVW: breakpointNumbers.huge,
  }
) {
  return `
  calc(
    ${minSize}px + (${maxSize} - ${minSize}) *
      (
        (100vw - ${minVw}px) /
          (
            ${maxVW} -
              ${minVw}
          )
      )
  );`
}
