import React from "react";
import Face from "./face2";
import { gsap } from "gsap";
import { ExpoScaleEase } from "gsap/all";
import clsx from "clsx";

gsap.registerPlugin(ExpoScaleEase);

function Hero() {
  const faceRef = React.useRef<Element | null>();

  React.useEffect(() => {
    if (!faceRef.current) {
      faceRef.current = document.querySelector("#face");
      gsap
        .timeline()
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
        .to("#Left-Echo", 2, {
          repeat: -1,
          scale: 0.98,
          yoyo: true,
          transformOrigin: "50%, 50%",
          ease: ExpoScaleEase.config(1, 0.98),
        })
        .to(
          "#Right-Echo",
          2,
          {
            repeat: -1,
            scale: 0.98,
            yoyo: true,
            transformOrigin: "50%, 50%",
            ease: ExpoScaleEase.config(1, 0.98),
          },
          "-=2"
        );
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          margin: "auto",
        }}
      >
        <Face id="face" className={""} />
      </div>
    </div>
  );
}

export default Hero;
