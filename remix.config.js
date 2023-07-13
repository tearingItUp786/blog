/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  // todo: change this to esm in v2
  serverModuleFormat: 'cjs',
  tailwind: true,
  future: {
    v2_dev: true,
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [/^gsap.*/],
}
