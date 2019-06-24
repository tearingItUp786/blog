import { breakpointNumbers } from "."

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
