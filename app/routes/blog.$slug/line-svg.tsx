export const LineSvg = () => {
	return (
		<>
			<div className="absolute top-[140px] left-0 hidden lg:block">
				<svg
					xmlSpace="preserve"
					style={{
						fillRule: 'evenodd',
						clipRule: 'evenodd',
						strokeMiterlimit: 10,
					}}
					viewBox="0 0 1549 7177"
					height="100%"
					width="100%"
				>
					<g transform="scale(.84813 4.01135)">
						<path
							d="M0 0h1825.73v1789.02H0z"
							style={{
								fill: 'none',
							}}
						/>
						<clipPath id="yolo">
							<path d="M0 0h1825.73v1789.02H0z" />
						</clipPath>
						<g clipPath="url(#yolo)">
							<path
								d="M-11.158-11.159c-6.163 0-11.159 4.996-11.159 11.159 0 6.162 4.996 11.158 11.159 11.158S0 6.162 0 0c0-6.163-4.995-11.159-11.158-11.159"
								className="fill-gray-200 dark:fill-white"
								style={{
									fillRule: 'nonzero',
								}}
								transform="matrix(0 -1.03872 -4.91278 0 858.888 27.844)"
							/>
							<path
								d="M0-1698.74h-75"
								className="stroke-section-title-color"
								style={{
									fill: 'none',
									fillRule: 'nonzero',
									strokeWidth: 2,
									stroke: 'currentColor',
								}}
								transform="matrix(4.91278 0 0 1.03872 860.893 1803.953)"
							/>
						</g>
					</g>
				</svg>
			</div>
			<div className="absolute top-[170px] left-20 hidden h-[calc(100%-170px)] w-[2px] bg-black lg:block dark:bg-white"></div>
		</>
	)
}
