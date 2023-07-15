/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  serverPlatform: 'node',
  serverModuleFormat: 'cjs',
  postcss: true,
  tailwind: true,
  future: {
    v2_dev: true,
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [/^gsap.*/, /\@algolia.*/],
}
