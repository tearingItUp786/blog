import React from "react"
import { graphql } from "gatsby"
import styled from "styled-components"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Title, Paragraph, BlockQuote, ShortQuote } from "../utils/styling/typo"
import { customMedia } from "../utils/styling"

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
`

const FlexParagraph = styled(Paragraph)`
  margin-left: 0;
  margin-right: 0;
  order: 2;
`

const FlexQuote = styled(ShortQuote)`
  align-self: start;
  margin-left: 0;
  margin-top: 0;
  margin-bottom: 2rem;
  width: 100%;
  padding-top: 0;
  flex-basis: 100%;

  ${customMedia.greaterThan("md")`
    margin-right: 0;
    margin-left: 2rem;
    margin-top: 0;
    flex: 1;
    order: 1;
`}
`

const ProfileImageContainer = styled.div`
  display: none;
  ${customMedia.greaterThan("md")`
    display: block;
  `}
`

function About(props) {
  const { data } = props
  return (
    <Layout location={props.location} title={"About Taran"}>
      <SEO title="About Taran Bains" />
      <Title marginBottom="0">About</Title>
      <Container>
        <ProfileImageContainer>
          <Img fixed={data.file.childImageSharp.fixed} />
        </ProfileImageContainer>
        <FlexQuote quote={false}>
          The only way that you’re ever going to get to the other side of this
          journey is by suffering. You have to suffer in order to grow. Some
          people get it, some people don’t. <br /> David Goggins
        </FlexQuote>
        <FlexParagraph>
          Taranveer Bains or Taran "tearing it up" Bains, as he likes to be
          called, is a Frontend Developer who has had the pleasure of working
          with some of the best digital agencies in Vancouver. He's worked on a
          variety of projects for companies such as BC Hydro, MasterCard, and
          Digital Asset. 1 part techie, 1 part business, and 100% dedicated to
          his craft and the communities he belongs to.{" "}
        </FlexParagraph>
      </Container>
    </Layout>
  )
}

export default About

export const query = graphql`
  query {
    file(absolutePath: { regex: "/about/" }) {
      childImageSharp {
        fixed(width: 200, height: 300) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
