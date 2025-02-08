// Import the necessary modules
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
// Create the plugins array with conditional inclusion of cssnano
const plugins = [
  tailwindcss,
  autoprefixer,
  postcssImport,
  process.env.NODE_ENV === 'production'
    ? cssnano({
      preset: ['default', { cssDeclarationSorter: false }],
    })
    : null,
].filter(Boolean)
// Export the configuration
export default { plugins }
