import {vitePlugin as remix} from '@remix-run/dev'
import {installGlobals} from '@remix-run/node'
import tsconfigPaths from 'vite-tsconfig-paths'
import {sentryVitePlugin} from '@sentry/vite-plugin'

import {defineConfig} from 'vite'

installGlobals()

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  ssr: {
    // things to exclude from the server bundle
    // noExternal: [/^gsap.*/, /@algolia.*/],
    // noExternal: [/@algolia.*/],
  },
  plugins: [
    remix({
      serverBuildFile: 'index.js',
      serverModuleFormat: 'esm',
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    tsconfigPaths(),
  ],
  build: {
    sourcemap: true,
  },
})
