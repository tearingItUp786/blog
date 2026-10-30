import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as defaultConfig } from '@epic-web/config/eslint'
import { includeIgnoreFile } from '@eslint/compat'

// These rules have no verified native Oxlint equivalent. Keep only this narrow
// compatibility layer in full checks, never on the staged commit path.
const retainedRule = (name) =>
	name.startsWith('epic-web/') ||
	name.startsWith('playwright/') ||
	name === 'import/order'

export default [
	...defaultConfig.map((config) => ({
		...config,
		rules: Object.fromEntries(
			Object.entries(config.rules ?? {}).filter(([name]) => retainedRule(name)),
		),
	})),
	includeIgnoreFile(
		path.join(path.dirname(fileURLToPath(import.meta.url)), '.gitignore'),
	),
	{ ignores: ['.opencode/plugins/swamp-audit.ts', 'extensions/**'] },
]
