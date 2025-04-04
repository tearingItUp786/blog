import { motion } from 'framer-motion'

export const OuterCircle = (props: any) => (
	<motion.svg
		viewBox="0 0 635 634"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		initial={{
			opacity: 0,
		}}
		animate={{
			opacity: 1,
		}}
		transition={{
			delay: 1,
			duration: 1,
		}}
		{...props}
	>
		<g
			className="origin-center scale-0 transition-transform duration-500 dark:scale-100"
			filter="url(#filter0_df_122_73)"
		>
			<motion.ellipse
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				transition={{
					delay: 1,
					duration: 1,
				}}
				cx={317.5}
				cy={317}
				rx={304.5}
				ry={304}
				fill="url(#paint0_radial_122_73)"
			/>
		</g>
		<defs>
			<filter
				id="filter0_df_122_73"
				x={0}
				y={0}
				width={635}
				height={634}
				filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB"
			>
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feMorphology
					radius={11}
					operator="dilate"
					in="SourceAlpha"
					result="effect1_dropShadow_122_73"
				/>
				<feOffset />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0.815686 0 0 0 0 0.360784 0 0 0 0 0.509804 0 0 0 1 0"
				/>
				<feBlend
					mode="normal"
					in2="BackgroundImageFix"
					result="effect1_dropShadow_122_73"
				/>
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="effect1_dropShadow_122_73"
					result="shape"
				/>
				<feGaussianBlur
					stdDeviation={6.5}
					result="effect2_foregroundBlur_122_73"
				/>
			</filter>
			<radialGradient
				id="paint0_radial_122_73"
				cx={0}
				cy={0}
				r={1}
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate(317.5 317) rotate(90) scale(304 304.5)"
			>
				<stop offset={0.87} stopColor="#FCE9EB" />
				<stop offset={1} stopColor="#768AC5" />
			</radialGradient>
		</defs>
		<g
			className="origin-center animate-[fadeIn_forwards_1s_.5s] opacity-0 transition-transform duration-500 dark:scale-0"
			filter="url(#filter0_f_176_10)"
		>
			<ellipse
				cx={317.5}
				cy={317}
				rx={304.5}
				ry={304}
				fill="url(#paint0_radial_176_10)"
			/>
		</g>
		<defs>
			<filter
				id="filter0_f_176_10"
				x={0}
				y={0}
				width={635}
				height={634}
				filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB"
			>
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="BackgroundImageFix"
					result="shape"
				/>
				<feGaussianBlur
					stdDeviation={6.5}
					result="effect1_foregroundBlur_176_10"
				/>
			</filter>
			<radialGradient
				id="paint0_radial_176_10"
				cx={0}
				cy={0}
				r={1}
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate(289.5 289) rotate(90) scale(276 276.5)"
			>
				<stop offset={0.675197} stopColor="#E3DEFF" />
				<stop offset={1} stopColor="#FFF8FE" />
			</radialGradient>
		</defs>
	</motion.svg>
)
