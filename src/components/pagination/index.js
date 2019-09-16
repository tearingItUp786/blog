import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"

const StyledSpan = styled.span`
  font-size: 14px;

  &:first-child {
    margin-right: 16px;
  }
`

function Pagination(props) {
  const {
    prevPage,
    nextPage,
    numPages,
    currentPage,
    prevText = null,
    nextText = null,
  } = props
  const showPrev = currentPage ? currentPage !== 1 : Boolean(prevPage)
  const showNext = currentPage ? currentPage !== numPages : Boolean(nextPage)

  return (
    <>
      {showPrev && (
        <Link to={prevPage} rel="prev">
          {/* eslint-disable-next-line */}
          <StyledSpan role="img" aria-label="Go back to previous page">
            ⬅️{prevText}
          </StyledSpan>
        </Link>
      )}
      {showNext && (
        <Link to={nextPage} rel="next">
          {/* eslint-disable-next-line */}
          <StyledSpan role="img" aria-label="Go to next page">
            {nextText} ➡️
          </StyledSpan>
        </Link>
      )}
    </>
  )
}

export default Pagination
