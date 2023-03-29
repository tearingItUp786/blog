/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  future: {
    unstable_tailwind: true,
  },
  serverDependenciesToBundle: [
    /^gsap.*/,
    /@cloudinary\/url-gen/,
    /@cloudinary\/transformation-builder-sdk/,
    /mdx-bundler/,
  ],
}
