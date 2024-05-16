import {motion} from 'framer-motion'

export const NameGroup = (props: any) => (
  <svg
    viewBox="0 0 308 159"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path
      initial={{pathLength: 0, fill: '#FFFFFF00'}}
      animate={{pathLength: 1, fill: '#B7B8D7'}}
      transition={{
        duration: 5,
        delay: 2,
      }}
      stroke="#B7B8D7"
      d="M170.04 138V113.96H161.96V110H182.6V113.96H174.56V138H170.04ZM189.864 138H185.504L193.384 110H199.624L207.504 138H203.064L201.064 130.72H191.864L189.864 138ZM192.984 126.76H199.944L196.544 114.56H196.384L192.984 126.76ZM216.889 122.16H222.649C225.049 122.16 226.649 120.52 226.649 118.04C226.649 115.6 225.049 113.96 222.649 113.96H216.889V122.16ZM212.409 138V110H222.449C227.449 110 230.969 113.32 230.969 118.08C230.969 121.72 228.929 124.52 225.689 125.6L231.849 138H226.929L221.009 126.12H216.889V138H212.409ZM238.313 138H233.953L241.833 110H248.073L255.953 138H251.513L249.513 130.72H240.313L238.313 138ZM241.433 126.76H248.393L244.993 114.56H244.833L241.433 126.76ZM274.978 131.36V110H279.138V138H273.218L264.018 114.44H263.858V138H259.698V110H266.418L274.818 131.36H274.978Z"
    />
    <motion.rect
      initial={{pathLength: 0, opacity: 0}}
      animate={{pathLength: 1, opacity: 1}}
      transition={{
        duration: 1,
        delay: 2,
      }}
      x={5.5}
      y={5.5}
      width={297}
      height={148}
      stroke="url(#paint0_linear_158_2)"
      strokeWidth={11}
      strokeLinecap="square"
    />
    <defs>
      <linearGradient
        id="paint0_linear_158_2"
        x1={215.126}
        y1={91.3304}
        x2={59.8114}
        y2={-0.181174}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#CC5C82" />
        <stop offset={1} stopColor="#758AC5" />
      </linearGradient>
    </defs>
  </svg>
)
