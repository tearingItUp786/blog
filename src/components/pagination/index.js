import React from "react"
import tw from "tailwind.macro"
import styled from "styled-components"
import { Link } from "gatsby"

const StyledSpan = styled.span`
  ${tw`text-2xl`};
`

const StyledPrevLink = styled(Link)`
  ${tw`mr-4`};
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
        <StyledPrevLink to={prevPage} rel="prev">
          {/* eslint-disable-next-line */}
          <StyledSpan role="img" aria-label="Go back to previous page">
            ⬅️{prevText}
          </StyledSpan>
        </StyledPrevLink>
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
