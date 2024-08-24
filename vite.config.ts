import {vitePlugin as remix} from '@remix-run/dev'
import {installGlobals} from '@remix-run/node'
import tsconfigPaths from 'vite-tsconfig-paths'
import {sentryVitePlugin} from '@sentry/vite-plugin'

import {defineConfig} from 'vite'

installGlobals()

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
