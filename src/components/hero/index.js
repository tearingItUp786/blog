import React from "react"
import styled from "styled-components"
import { useStaticQuery } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import { fluidFontSize } from "../../utils/styling/helper"
import { H3 } from "../../utils/styling/base-components"
import media from "styled-media-query"

const ImageBackground = styled(BackgroundImage)`
  background-position: top 20% center;
  background-size: cover;
  height: 50vh;

  /* override the default margin for sibling elements  */
  + * {
    margin-top: 0;
  }
`

const TextBox = styled.div`
  background-image: linear-gradient(to top, #cc00004d 2rem, #f5ae0052);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 5vw;
  justify-content: flex-end;
  width: 100%;

  ${media.greaterThan("medium")`
    padding: 0 calc((100vw - 793px) / 2) 2rem
  `}

  h3 {
    margin-bottom: 8px;
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
        <H3>Welcome to my domain</H3>
        <p>Written by Taran "tearing it up" Bains</p>
      </TextBox>
    </ImageBackground>
  )
}

export default Hero
