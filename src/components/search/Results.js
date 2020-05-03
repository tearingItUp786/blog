import React from "react"
import { SList } from "./styled-comps"

function Results({ results }) {
  if (results.length === 0) return null
  console.log(results)

  return (
    <SList>
      {results.map(page => (
        <React.Fragment key={page.title}>
          <li>{page.title}</li>
          {JSON.stringify(page, null, 4)}
        </React.Fragment>
      ))}
    </SList>
  )
}

export default Results
