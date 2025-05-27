import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

import { reactRouterDevTools } from 'react-router-devtools'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// {
//       serverBuildFile: 'index.js',
//       serverModuleFormat: 'esm',
//     }

export default defineConfig({
	ssr: {
		// things to exclude from the server bundle
		// noExternal: [/^gsap.*/, /@algolia.*/],
		// noExternal: [/@algolia.*/],
	},
	plugins: [
		reactRouterDevTools(),
		reactRouter(),
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
