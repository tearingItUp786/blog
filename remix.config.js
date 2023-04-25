/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [/^gsap.*/],
}
