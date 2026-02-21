const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	theme: {
		screens: {
			md: '640px',
			lg: '1024px',
			xl: '1536px',
		},
		fontFamily: {
			body: ['CommitMono', ...defaultTheme.fontFamily.sans],
			display: ['CommitMono', ...defaultTheme.fontFamily.sans],
		},
		extend: {
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
			typography: (theme) => {
				const fontSize = (size) => {
					const result = theme(`fontSize.${size}`)
					return Array.isArray(result) ? result[0] : result
				}

				const fontFamily = (family, fallback) => {
					const result = theme(`fontFamily.${family}`)

					if (Array.isArray(result)) {
						return result.join(', ')
					}

					if (typeof result === 'string') {
						return result
					}

					return fallback
				}

				return {
					DEFAULT: {
						css: [
							{
								'--tw-prose-body': 'var(--body-text)',
								'--tw-prose-headings': 'var(--section-title-color)',
								'--tw-prose-lead': 'var(--subheading-color)',
								'--tw-prose-links': 'var(--accent)',
								'--tw-prose-bold': 'var(--section-title-color)',
								'--tw-prose-counters': 'var(--accent)',
								'--tw-prose-bullets': 'var(--accent)',
								'--tw-prose-hr': 'var(--border-color)',
								'--tw-prose-quotes': 'var(--section-title-color)',
								'--tw-prose-quote-borders': 'var(--border-color)',
								'--tw-prose-captions': 'var(--subheading-color)',
								'--tw-prose-code': 'var(--section-title-color)',
								'--tw-prose-pre-code': 'var(--body-text-inverse)',
								'--tw-prose-pre-bg': 'var(--section-title-color)',
								'--tw-prose-th-borders': 'var(--border-color)',
								'--tw-prose-td-borders':
									'var(--color-pink-200)' /* keep light tint for contrast */,

								'--tw-prose-invert-body': 'var(--body-text-inverse)',
								'--tw-prose-invert-headings': 'var(--body-text-inverse)',
								'--tw-prose-invert-lead': 'var(--subheading-color)',
								'--tw-prose-invert-links': 'var(--accent)',
								'--tw-prose-invert-bold': 'var(--body-text-inverse)',
								'--tw-prose-invert-counters': 'var(--accent)',
								'--tw-prose-invert-bullets': 'var(--accent)',
								'--tw-prose-invert-hr': 'var(--border-color)',
								'--tw-prose-invert-quotes': 'var(--body-text-inverse)',
								'--tw-prose-invert-quote-borders': 'var(--border-color)',
								'--tw-prose-invert-captions': 'var(--subheading-color)',
								'--tw-prose-invert-code': 'var(--body-text-inverse)',
								'--tw-prose-invert-pre-code': 'var(--subheading-color)',
								'--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
								'--tw-prose-invert-th-borders': 'var(--border-color)',
								'--tw-prose-invert-td-borders': 'var(--border-color)',
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
									fontFamily: fontFamily('display', 'CommitMono'),
									fontWeight: theme('fontWeight.bold'),
									fontSize: fontSize('3xl'),
									marginTop: theme('spacing.10'),
									marginBottom: theme('spacing.5'),
								},
								h3: {
									fontFamily: fontFamily('display', 'CommitMono'),
									fontWeight: theme('fontWeight.bold'),
									fontSize: fontSize('2xl'),
									marginTop: theme('spacing.8'),
									marginBottom: theme('spacing.2'),
								},
								h4: {
									fontFamily: fontFamily('body', 'CommitMono'),
									fontSize: fontSize('xl'),
									fontWeight: theme('fontWeight.normal'),
									marginTop: theme('spacing.10'),
									marginBottom: theme('spacing.1'),
								},
								h5: {
									fontFamily: fontFamily('body', 'CommitMono'),
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
	plugins: [require('@tailwindcss/typography')],
}
