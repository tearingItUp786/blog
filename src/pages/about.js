import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Title, Paragraph } from "../utils/styling/typo"

function About(props) {
  return (
    <Layout location={props.location} title={"About Taran"}>
      <SEO title="About Taran Bains" />
      <Title marginBottom="0">About</Title>
      <Paragraph>
        Taranveer Bains or Taran "tearing it up" Bains, as he likes to be
        called, is a Frontend Developer who has had the pleasure of working with
        some of the best digital agencies in Vancouver. He's worked on a variety
        of projects for companies such as BC Hydro, MasterCard, and Digital
        Asset. 1 part techie, 1 part business, and 100% dedicated to his craft
        and the communities he belongs to.{" "}
      </Paragraph>
    </Layout>
  )
}

export default About
