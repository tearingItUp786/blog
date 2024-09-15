// Import the necessary modules
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import cssnano from 'cssnano'
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
