import React from "react"
import styled from "styled-components"
import { useStaticQuery } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import { fluidFontSize } from "../../utils/styling/helper"
import media from "styled-media-query"

const ImageBackground = styled(BackgroundImage)`
  background-position: top 20% center;
  background-size: cover;
  height: 65vh;

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
  padding-left: 5vw;
  justify-content: flex-end;
  width: 100%;

  ${media.greaterThan("medium")`
    padding: 0 calc((100vw - 793px) / 2) 2rem
  `}

  h2 {
    margin-bottom: 8px;
    font-size: ${props => props.theme.fontSizes.h2}
    color: ${props => props.theme.colors.body};
  }

  p {
    font-weight: 300;
    margin-top: 0;
    color: ${props => props.theme.colors.body || "white"};
  }
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
        <h2>Welcome to my domain</h2>
        <p>Home to the thoughts of Taran "tearing it up" Bains</p>
      </TextBox>
    </ImageBackground>
  )
}

export default Hero
