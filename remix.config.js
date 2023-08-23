/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  serverPlatform: 'node',
  serverModuleFormat: 'cjs',
  tailwind: true,
  watchPaths: ['./tailwind.config.js'],
  future: {
    v2_dev: true,
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [/^gsap.*/, /@algolia.*/],
}
