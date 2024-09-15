import lightSparkles from './light-sparkles.png'

//p-translate-x-[50%] -translate-y-[50%]
const Sparkles = (props: any) => (
  <svg
    viewBox="0 0 999 1080"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <g mask="url(#mask)">
      <rect
        y={-16}
        width={999}
        height={1113}
        fill="url(#pattern0_127_6)"
        className="opacity-0 transition-all duration-200 dark:opacity-100"
      />
      <rect
        y={-16}
        width={999}
        height={1113}
        fill="url(#pattern0_176_3)"
        className="opacity-100 transition-all duration-200  dark:opacity-0"
      />
    </g>
    <defs>
      <radialGradient id="fade">
        <stop offset="90%" stopColor="white" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      <mask id="mask">
        <rect x="0" y="0" width={999} height={1113} fill="url(#fade)" />
      </mask>
      <pattern
        id="pattern0_127_6"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <use
          xlinkHref="#image0_127_6"
          transform="matrix(0.000591366 0 0 0.000530795 0 -0.000274164)"
        />
      </pattern>
      <image
        id="image0_127_6"
        width={1691}
        height={1885}
        xlinkHref={lightSparkles}
      />
      <pattern
        id="pattern0_176_3"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <use
          xlinkHref="#image0_176_3"
          transform="matrix(0.000580873 0 0 0.000521376 -0.043697 0)"
        />
      </pattern>
      <image
        id="image0_176_3"
        width={1872}
        height={1918}
        xlinkHref={lightSparkles}
      />
    </defs>
  </svg>
)
export default Sparkles
