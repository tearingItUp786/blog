import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import { fluidFontSize } from "../../utils/styling/helper"

const StyledSpan = styled.span`
  font-size: ${fluidFontSize({ minSize: 16, maxSize: 20 })};

  &:first-child {
    margin-right: 16px;
  }
`

function Pagination(props) {
  const { prevPage, nextPage, numPages, currentPage } = props
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages

  return (
    <>
      {!isFirst && (
        <Link to={prevPage} rel="prev">
          {/* eslint-disable-next-line */}
          <StyledSpan role="img" aria-label="Go back to previous page">
            ⬅️
          </StyledSpan>
        </Link>
      )}
      {!isLast && (
        <Link to={nextPage} rel="next">
          {/* eslint-disable-next-line */}
          <StyledSpan role="img" aria-label="Go to next page">
            ➡️
          </StyledSpan>
        </Link>
      )}
    </>
  )
}

export default Pagination
