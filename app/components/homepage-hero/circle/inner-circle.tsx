import { motion } from 'framer-motion'

export const InnerCircle = (props: any) => (
	<motion.svg
		viewBox="0 0 480 480"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<motion.circle
			initial={{
				opacity: 0,
				scale: 0.5,
			}}
			animate={{
				opacity: 1,
				scale: 1,
			}}
			transition={{
				duration: 0.5,
			}}
			fill="url(#paint0_linear_122_74)"
			cx={240}
			cy={240}
			r={240}
		/>
		<defs>
			<linearGradient
				id="paint0_linear_122_74"
				x1={240}
				y1={-0.00000402084}
				x2={374.917}
				y2={454.144}
				gradientUnits="userSpaceOnUse"
			>
				<stop offset={0.405} stopColor="#CEC8DE" />
				<stop offset={1} stopColor="white" stopOpacity={0} />
			</linearGradient>
		</defs>
	</motion.svg>
)
