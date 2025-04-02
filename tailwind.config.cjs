const path = require('path')
const defaultTheme = require('tailwindcss/defaultTheme')
const fromRoot = (p) => path.join(__dirname, p)

module.exports = {
	darkMode: 'class',
	variants: {},
	corePlugins: {
		// aspectRatio: false,
	},
	theme: {
		screens: {
			md: '640px',
			lg: '1024px',
			xl: '1536px',
		},
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			// basic variable color set up
			pink: 'var(--color-hot-pink)', // Updated to reflect vibrant hot-pink
			white: 'var(--color-pure-white)', // Updated as per the new off-white definition
			'off-white': 'var(--color-off-white)',
			'light-gray': 'var(--color-light-gray)',
			'silver-gray': 'var(--color-silver-gray)',
			'medium-gray': 'var(--color-medium-gray)',
			gray: {
				100: 'var(--color-dark-gray-100)', // Adjusted naming for consistency with dark grays
				200: 'var(--color-dark-gray-200)', // Reflects the expressive intent of its dark gray hue
			},
			'charcoal-gray': 'var(--color-charcoal-gray)',
			black: 'var(--color-true-black)', // Updated for clarity using the new naming convention
			// theme based colors
			accent: 'var(--accent)',
			body: 'var(--body-text)',
			'inverse-body': 'var(--body-text-inverse)',
			'border-color': 'var(--border-color)',
			'bg-color': 'var(--bg-color)',
			'blog-title-color': 'var(--blog-title-color)',
			'section-title-color': 'var(--section-title-color)',
			'subheading-color': 'var(--subheading-color)',
			alert: '#B4198C', // Darker pink/magenta that complements #EB36A1
			info: '#1E6BC8', // Rich blue that pairs well with the pink
			warning: '#C87A00', // Amber/orange that complements the palette
			success: '#0D9B55', // Emerald green that balances with the pink
		},
		fontFamily: {
			body: ['CommitMono', ...defaultTheme.fontFamily.sans],
			display: ['CommitMono', ...defaultTheme.fontFamily.sans],
		},
		extend: {
			boxShadow: {
				'custom-black': '0px 0px 30px 0px #00000040',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				sparkle: {
					'0%': { transform: 'scale(0.25)' },
					'25%': { opacity: 1 },
					'100%': { opacity: 0 },
				},
				twinkle: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
			},
			animation: {
				twinkle: 'twinkle 3s infinite alternate',
				sparkle: 'sparkle 3s infinite',
				fadeIn: 'fadeIn 1s ease-in-out',
				'spin-fast': 'spin .5s linear infinite',
			},
			fontSize: {
				xl: '1.375rem', // 22px
				'2xl': '1.5625rem', // 25px
				'3xl': '1.875rem', // 30px
				'4xl': '2.5rem', // 40px
				'5xl': '3.125rem', // 50px
				'6xl': '3.75rem', // 60px
				'7xl': '4.375rem', // 70px
			},
			gridTemplateRows: {
				'max-content': 'max-content',
			},
			fontFamily: {
				sans: ['CommitMono', ...defaultTheme.fontFamily.sans],
			},
			dropShadow: {
				toggle: '6px 4px 8px var(--color-gray-300)',
			},
			typography: (theme) => {
				const fontSize = (size) => {
					const result = theme(`fontSize.${size}`)
					return Array.isArray(result) ? result[0] : result
				}

				return {
					DEFAULT: {
						css: [
							{
								'> *': {
									gridColumn: '1 / -1',

									[`@media (min-width: ${theme('screens.lg')})`]: {
										gridColumn: '2 / span 10',
									},
								},
								'h1,h2,h3,h4,h5,h6': {
									'> a': {
										transition: 'color 300ms',
										textDecoration: 'none',
										color: 'inherit',
										fontWeight: 'inherit',

										'&:hover': {
											textDecoration: 'underline',
											color: 'var(--accent)',
										},
									},
								},
								h2: {
									fontFamily: theme('fontFamily.display').join(', '),
									fontWeight: theme('fontWeight.bold'),
									fontSize: fontSize('3xl'),
									marginTop: theme('spacing.10'),
									marginBottom: theme('spacing.5'),
								},
								h3: {
									fontFamily: theme('fontFamily.display').join(', '),
									fontWeight: theme('fontWeight.bold'),
									fontSize: fontSize('2xl'),
									marginTop: theme('spacing.8'),
									marginBottom: theme('spacing.2'),
								},
								h4: {
									fontFamily: theme('fontFamily.body').join(', '),
									fontSize: fontSize('xl'),
									fontWeight: theme('fontWeight.normal'),
									marginTop: theme('spacing.10'),
									marginBottom: theme('spacing.1'),
								},
								h5: {
									fontFamily: theme('fontFamily.body').join(', '),
									fontSize: fontSize('lg'),
									fontWeight: theme('fontWeight.normal'),
									marginTop: theme('spacing.16'),
									marginBottom: theme('spacing.10'),
								},
								p: {
									marginTop: theme('spacing.4'),
									marginBottom: theme('spacing.4'),
									color: 'var(--body-text)',
									fontWeight: 500,
									fontSize: fontSize('md'),
									lineHeight: theme('lineHeight.relaxed'),
								},
								strong: {
									fontWeight: 500,
									color: 'var(--accent)',
								},
								a: {
									fontWeight: theme('fontWeight.bold'),
									color: 'var(--accent)',
									'> *, p': {
										color: 'inherit',
									},
								},
								blockquote: {
									border: 'none',
									padding: 0,
									fontStyle: 'oblique',
									fontWeight: 200,
									fontSize: fontSize('3xl'),
									textTransform: 'uppercase',
									marginTop: theme('spacing.6'),
									marginBottom: theme('spacing.6'),
								},
								'.embed': {
									position: 'relative',
									marginRight: '0 !important',
									maxWidth: '1278px',
									marginLeft: 0,
									[`@media (min-width: ${theme('screens.2xl')})`]: {
										marginRight: '40vw !important',
									},
								},
								'.embed > div': {
									height: '0px',
								},
								'.embed > div > iframe': {
									height: '100% !important',
									width: '100% !important',
									top: '0',
									left: '0',
									position: 'absolute',
									border: 'none',
									borderRadius: '0 !important',
								},
								'ol,ul': {
									marginTop: 0,
								},
								'ol, ul > li': {
									fontSize: fontSize('lg'),
									fontWeight: 500,
								},
							},
						],
					},
					light: {
						css: [
							{
								'h1,h2': {
									color: 'var(--color-gray-200)',
								},
								'h3,h4,h5,h6': {
									color: 'var(--color-gray-100)',
								},
								'ul,ol': {
									color: 'var(--color-gray-100)',
								},
								code: {
									color: 'var(--color-body)',
								},
							},
						],
					},
					dark: {
						css: [
							{
								'h1,h2,h3,h4,h5,h6': {
									color: 'var(--color-off-white)',
								},
								'ol, ul': {
									color: 'var(--color-off-white)',
								},
								code: {
									color: 'var(--color-accent)',
								},
							},
						],
					},
				}
			},
		},
	},

	content: [
		fromRoot('./app/**/*.+(js|jsx||ts|tsx|mdx|md|svg)'),
		fromRoot('./content/**/*.+(js|jsx|ts|tsx|mdx|md)'),
	],
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/aspect-ratio'),
	],
}
