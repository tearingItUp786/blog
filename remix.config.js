/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  serverPlatform: 'node',
  serverModuleFormat: 'cjs',
  watchPaths: ['./tailwind.config.js'],
  serverDependenciesToBundle: [/^gsap.*/, /@algolia.*/],
}
