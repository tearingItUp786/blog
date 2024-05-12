import {vitePlugin as remix} from '@remix-run/dev'
import {installGlobals} from '@remix-run/node'
import tsconfigPaths from 'vite-tsconfig-paths'

import {defineConfig} from 'vite'

installGlobals()

export default defineConfig({
  ssr: {
    // things to exclude from the server bundle
    // noExternal: [/^gsap.*/, /@algolia.*/],
    noExternal: [/@algolia.*/],
  },
  plugins: [
    remix({
      serverBuildFile: 'index.mjs',
      serverModuleFormat: 'esm',
    }),
    tsconfigPaths(),
  ],
})
