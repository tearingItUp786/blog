import React from "react"
import styled from "styled-components"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { TagsPageLink, Title } from "../utils/styling/typo"

const genLookUp = (acc, val) => {
  const key = val.fieldValue[0].toUpperCase()
  if (!acc[key]) acc[key] = []
  acc[key].push(val)
  return acc
}

const TagsContainer = styled.div`
  margin-bottom: 3rem;
  &:last-of-type {
    margin-bottom: 0;
  }
`

const TagsLinkContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-left: 1rem;
`

function Tags({
  data: {
    allMdx: { group },
  },
}) {
  // group by first letter, construct alphabetized list
  const lookup = group.reduce(genLookUp, {})
  const body = Object.entries(lookup).map(([key, val]) => {
    return (
      <TagsContainer key={key}>
        <h2>{key}</h2>
        <TagsLinkContainer>
          {val.map(({ fieldValue, totalCount }) => (
            <TagsPageLink key={fieldValue} href={`./tags/${fieldValue}/`}>
              {fieldValue} ({totalCount})
            </TagsPageLink>
          ))}
        </TagsLinkContainer>
      </TagsContainer>
    )
  })

  return (
    <Layout>
      <SEO title="All Tags" />
      <Title marginBottom="0">All Tags</Title>
      <hr />
      {body}
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query {
    allMdx {
      group(field: frontmatter___tag) {
        fieldValue
        totalCount
      }
    }
  }
`
