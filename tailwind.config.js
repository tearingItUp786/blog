const path = require('path')
const defaultTheme = require('tailwindcss/defaultTheme')
const fromRoot = p => path.join(__dirname, p)

module.exports = {
  darkMode: 'class',
  variants: {},
  corePlugins: {
    aspectRatio: false,
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
      white: 'var(--color-white)',
      black: 'var(--color-black)',
      pink: 'var(--color-pink)',
      gray: {
        100: 'var(--color-gray-100)',
        200: 'var(--color-gray-200)',
        300: 'var(--color-gray-300)',
      },
      accent: 'var(--accent)',
    },
    fontFamily: {
      body: ['Avenir', ...defaultTheme.fontFamily.sans],
      display: ['Lemon', ...defaultTheme.fontFamily.sans],
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
        sans: ['Avenir', ...defaultTheme.fontFamily.sans],
      },
      dropShadow: {
        toggle: '6px 4px 8px var(--color-gray-300)',
      },
      typography: theme => {
        const fontSize = size => {
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
                    gridColumn: '3 / span 8',
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
                  fontFamily: theme('fontFamily.body').join(', '),
                  fontWeight: theme('fontWeight.bold'),
                  fontSize: fontSize('3xl'),
                  marginTop: theme('spacing.10'),
                  marginBottom: theme('spacing.5'),
                },
                h3: {
                  fontFamily: theme('fontFamily.body').join(', '),
                  fontWeight: theme('fontWeight.medium'),
                  fontSize: fontSize('2xl'),
                  marginTop: theme('spacing.8'),
                  marginBottom: theme('spacing.2'),
                },
                h4: {
                  fontFamily: theme('fontFamily.body').join(', '),
                  fontSize: fontSize('xl'),
                  fontWeight: theme('fontWeight.medium'),
                  marginTop: theme('spacing.10'),
                  marginBottom: theme('spacing.1'),
                },
                h5: {
                  fontFamily: theme('fontFamily.body').join(', '),
                  fontSize: fontSize('lg'),
                  fontWeight: theme('fontWeight.medium'),
                  marginTop: theme('spacing.16'),
                  marginBottom: theme('spacing.10'),
                },
                p: {
                  marginTop: 0,
                  marginBottom: theme('spacing.6'),
                  color: 'var(--body-text)',
                  fontWeight: 500,
                  fontSize: fontSize('lg'),
                  lineHeight: theme('lineHeight.relaxed'),
                },
                strong: {
                  fontWeight: 500,
                  color: 'var(--accent)',
                },
                a: {
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
                  fontSize: fontSize('2xl'),
                  textTransform: 'uppercase',
                  marginTop: theme('spacing.4'),
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
              },
            ],
          },
          light: {
            css: [
              {
                'h1,h2': {
                  color: 'var(--color-gray-100)',
                },
                'h3,h4,h5,h6': {
                  color: 'var(--color-gray-300)',
                },
                'ul,ol': {
                  color: 'var(--color-gray-300)',
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
                  color: 'var(--color-white)',
                },
                'ol, ul': {
                  color: 'var(--color-white)',
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
    fromRoot('./app/**/*.+(js|jsx||ts|tsx|mdx|md)'),
    fromRoot('./content/**/*.+(js|jsx|ts|tsx|mdx|md)'),
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}
