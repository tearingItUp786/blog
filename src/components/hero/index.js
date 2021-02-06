import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import Img from "gatsby-image"

function Hero(props) {
  const data = useStaticQuery(graphql`
    query {
      file(absolutePath: { regex: "/taran1/" }) {
        childImageSharp {
          fluid(maxWidth: 1920, maxHeight: 1080) {
            ...GatsbyImageSharpFluid
            ...GatsbyImageSharpFluidLimitPresentationSize
          }
        }
      }
    }
  `)

  console.log("data", data)
  return (
    <div style={{ width: "100vw" }}>
      <Img fluid={data.file.childImageSharp.fluid} />
    </div>
  )
}

export default Hero
