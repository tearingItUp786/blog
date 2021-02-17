import React from "react"
import Face from "./face2.inline.svg"
import { gsap } from "gsap"
import { ExpoScaleEase, TimelineLite } from "gsap/all"

import styled from "styled-components"

gsap.registerPlugin(ExpoScaleEase)

const HiddenFace = styled(Face)`
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
`

function Hero(props) {
  const faceRef = React.useRef()

  React.useLayoutEffect(() => {
    if (!faceRef.current) {
      faceRef.current = document.querySelector("#face")
      new TimelineLite()
        .set("svg", { visibility: "visible" })
        .set("#Middle-Face", {
          scale: 1.5,
          transformOrigin: "50% 50%",
        })
        .from("#Middle-Face path", 0.75, {
          delay: 0.5,
          stroke: "rgb(255, 0, 255)",
        })
        .to(
          "#Middle-Face",
          0.75,
          {
            scale: 1,
            transformOrigin: "50% 50%",
            ease: ExpoScaleEase.config(3, 1),
          },
          "-=.75"
        )
        .from("#Right-Echo", 0.5, {
          opacity: 0,
          x: -250,
          ease: ExpoScaleEase.config(0.2, 1),
        })
        .from(
          "#Left-Echo",
          0.5,
          {
            opacity: 0,
            x: 250,
            ease: ExpoScaleEase.config(0.2, 1),
          },
          "-=0.5"
        )
        .from("#Right-Face", 0.5, {
          opacity: 0,
          scale: 1.5,
          transformOrigin: "50% 50%",
          ease: ExpoScaleEase.config(1.5, 1),
        })
        .from(
          "#Left-Face",
          0.5,
          {
            opacity: 0,
            scale: 1.5,
            transformOrigin: "50% 50%",
            ease: ExpoScaleEase.config(1.5, 1),
          },
          "-=.5"
        )
    }
  }, [])

  return (
    <div style={{ width: "100vw" }}>
      <div
        style={{
          maxWidth: "1080px",
          margin: "auto",
        }}
      >
        <HiddenFace $visible={Boolean(faceRef.current)} id="face" />
      </div>
    </div>
  )
}

export default Hero
