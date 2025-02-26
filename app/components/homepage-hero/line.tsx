import { motion } from 'framer-motion'

export const LineSvg = (props: any) => (
	<svg
		viewBox="0 0 4 252"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<motion.line
			x1={2}
			y1={8.74228e-8}
			x2={1.99999}
			y2={252}
			className="stroke-[#B582C6] dark:stroke-[#B7B8D7]"
			strokeWidth={4}
			initial={{ pathLength: 0, opacity: 0 }}
			animate={{ pathLength: 1, opacity: 1 }}
			transition={{
				duration: 1,
				delay: 2,
			}}
		/>
	</svg>
)
