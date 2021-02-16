import React from "react"
import Face from "./face2.inline.svg"
import { gsap } from "gsap"
import { ExpoScaleEase, TimelineLite } from "gsap/all"
import { useGlobalAppDispatch, useGlobalAppState } from "../global-provider"
import { updateVisitedHome } from "../global-provider/reducer"
import styled from "styled-components"

gsap.registerPlugin(ExpoScaleEase)

const HiddenFace = styled(Face)`
  visibility: hidden;
`

function Hero(props) {
  const faceRef = React.useRef()
  const { visitedHome } = useGlobalAppState()
  const globalDispatch = useGlobalAppDispatch()
  React.useEffect(() => {
    if (!faceRef.current && !visitedHome) {
      faceRef.current = document.querySelector("#face")
      new TimelineLite()
        .set("svg", { visibility: "visible" })
        .from("#Middle-Face", 1, {
          opacity: 0,
          stagger: 2,
          scale: 3.5,
          transformOrigin: "50% 50%",
          ease: ExpoScaleEase.config(3.5, 1),
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
          0.3,
          {
            opacity: 0,
            x: -150,
          },
          "-=.5"
        )
        .from("#Right-Face", 1, {
          opacity: 0,
          scale: 2,
          transformOrigin: "50% 50%",
          ease: ExpoScaleEase.config(2, 1),
        })
        .from(
          "#Left-Face",
          1,
          {
            opacity: 0,
            scale: 2,
            transformOrigin: "50% 50%",
            ease: ExpoScaleEase.config(2, 1),
          },
          "-=1"
        )
      updateVisitedHome(globalDispatch)
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
        <HiddenFace id="face" />
      </div>
    </div>
  )
}

export default Hero
