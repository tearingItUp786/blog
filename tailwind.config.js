const path = require("path");
const defaultTheme = require("tailwindcss/defaultTheme");
const fromRoot = (p) => path.join(__dirname, p);

module.exports = {
  mode: process.env.NODE_ENV ? "jit" : undefined,
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    screens: {
      md: "640px",
      lg: "1024px",
      xl: "1500px",
    },
  },
  variants: {},
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
