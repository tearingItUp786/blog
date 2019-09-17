import styled from "styled-components"
import tw from "tailwind.macro"
import { arrToFontString } from "../helpers"

export const Title = styled.h1`
  ${tw`rounded text-accent`};
  font-family: ${props =>
    props.theme.fontFamily.display.reduce(arrToFontString)};
`
