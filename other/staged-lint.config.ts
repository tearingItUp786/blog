import { toolingConfig } from '../vite.config.ts'

// Staged checks share the full rule policy, but never start a whole-project
// TypeScript program. Type-aware rules and compiler diagnostics run in CI.
export default {
	lint: {
		...toolingConfig.lint,
		options: { typeAware: false, typeCheck: false },
	},
}
