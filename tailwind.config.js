const path = require("path");
const defaultTheme = require("tailwindcss/defaultTheme");
const fromRoot = (p) => path.join(__dirname, p);

module.exports = {
  darkMode: "class",
  variants: {},
  theme: {
    screens: {
      md: "640px",
      lg: "1024px",
      xl: "1500px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "var(--color-white)",
      black: "var(--color-black)",
      pink: "var(--color-pink)",
      gray: {
        100: "var(--color-gray-100)",
        200: "var(--color-gray-200)",
        300: "var(--color-gray-300)",
      },
    },
    fontFamily: {
      body: ["Avenir", ...defaultTheme.fontFamily.sans],
      display: ["Lemon", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      dropShadow: {
        toggle: "6px 4px 8px var(--color-gray-300)",
      },
      typography: (theme) => {
        return {
          DEFAULT: {
            css: [
              {
                p: {
                  marginTop: 0,
                  marginBottom: theme("spacing.4"),
                },
              },
            ],
          },
        };
      },
    },
  },
  purge: {
    mode: "layers",
    enabled: process.env.NODE_ENV === "production",
    content: [fromRoot("./app/**/*.+(js|ts|tsx|mdx|md)")],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
  ],
};
