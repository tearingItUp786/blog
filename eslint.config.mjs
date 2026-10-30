import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as defaultConfig } from '@epic-web/config/eslint'
import { includeIgnoreFile } from '@eslint/compat'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

/** @type {import('eslint').Linter.Config} */
export default [
	...defaultConfig,
	includeIgnoreFile(gitignorePath),
	// Swamp manages this plugin for OpenCode's separate Bun environment.
	{ ignores: ['.opencode/plugins/swamp-audit.ts'] },
]
