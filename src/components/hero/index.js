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
        .from("#Middle-Face", 0.75, {
          opacity: 0,
          delay: 0.5,
          scale: 3,
          transformOrigin: "50% 50%",
          ease: ExpoScaleEase.config(3, 1),
        })
        .from(
          "#Left-Echo",
          0.5,
          {
            opacity: 0,
            x: 0,
          },
          "-=.5"
        )
        .from(
          "#Right-Echo",
          0.5,
          {
            opacity: 0,
            x: -175,
          },
          "-=.5"
        )
        .from("#Right-Face", 0.75, {
          opacity: 0,
          scale: 1.5,
          transformOrigin: "50% 50%",
          ease: ExpoScaleEase.config(1.5, 1),
        })
        .from(
          "#Left-Face",
          0.75,
          {
            opacity: 0,
            scale: 1.5,
            transformOrigin: "50% 50%",
            ease: ExpoScaleEase.config(1.5, 1),
          },
          "-=.75"
        )
    }
  }, [])

  return (
    <div style={{ width: "100vw" }}>
      <div
        style={{
          width: "calc(1280px * .66)",
          maxWidth: "90vw",
          margin: "auto",
        }}
      >
        <HiddenFace $visible={Boolean(faceRef.current)} id="face" />
      </div>
    </div>
  )
}

export default Hero
