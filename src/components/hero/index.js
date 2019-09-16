import React from "react"
import styled from "styled-components"
import { useStaticQuery, graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import media from "styled-media-query"

const ImageBackground = styled(BackgroundImage)`
  background-position: top 20% center;
  background-size: cover;
  height: 65vh;
  width: 100vw;

  /* override the default margin for sibling elements  */
  + * {
    margin-top: 0;
  }
`

const TextBox = styled.div`
  background-image: linear-gradient(to top, #f5ae012b 2rem, #0000008c);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  width: 100%;

  h2 {
    margin-bottom: 8px;
  }

  p {
    font-weight: 300;
    margin-top: 0;
  }
`

const TextWrapper = styled.div`
  width: 800px;
  max-width: 90vw;
  margin-left: auto;
  margin-right: auto;
`

const Hero = () => {
  const { image } = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "lion-hero.jpg" }) {
        sharp: childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

  return (
    <ImageBackground Tag="section" fluid={image.sharp.fluid} fadeIn="soft">
      <TextBox>
        <TextWrapper>
          <h2>Welcome to my domain</h2>
          <p>Home to the thoughts of Taran "tearing it up" Bains</p>
        </TextWrapper>
      </TextBox>
    </ImageBackground>
  )
}

export default Hero
