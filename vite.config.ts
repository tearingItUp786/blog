import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { reactRouterDevTools } from 'react-router-devtools'
import { defineConfig, lazyPlugins, type UserConfig } from 'vite-plus'
import tsconfigPaths from 'vite-tsconfig-paths'

const scriptFiles = ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}']
const testFiles = [
	'**/tests/**',
	'**/#tests/**',
	'**/__tests__/**',
	'**/*.{test,spec}.*',
]
const unusedVariables = {
	args: 'after-used',
	argsIgnorePattern: '^(_|ignored)',
	ignoreRestSiblings: true,
	varsIgnorePattern: '^(_|ignored)',
} as const

export const toolingConfig = {
	lint: {
		plugins: ['typescript', 'import', 'react', 'vitest'],
		// Keep the former rule set, rather than silently enabling new recommended rules.
		categories: { correctness: 'off' },
		env: { browser: true, node: true, builtin: true },
		options: { typeAware: true, typeCheck: true },
		ignorePatterns: [
			'**/.cache/**',
			'**/node_modules/**',
			'**/build/**',
			'**/public/**',
			'**/playwright-report/**',
			'**/server-build/**',
			'**/dist/**',
			'**/coverage/**',
			'**/*.tsbuildinfo',
			'**/.react-router/**',
			'**/.wrangler/**',
			'**/worker-configuration.d.ts',
			'.opencode/plugins/swamp-audit.ts',
			'extensions/**', // Deno extensions are checked with Deno, not app TypeScript.
		],
		rules: {
			'no-unexpected-multiline': 'error',
			'no-warning-comments': [
				'error',
				{ terms: ['FIXME'], location: 'anywhere' },
			],
			'import/no-duplicates': ['warn', { preferInline: true }],
		},
		overrides: [
			{ files: ['**/*.{tsx,jsx}'], rules: { 'react/jsx-key': 'warn' } },
			{
				files: scriptFiles,
				rules: {
					'react/rules-of-hooks': 'error',
					'react/exhaustive-deps': 'warn',
				},
			},
			{
				files: ['**/*.{js,jsx,mjs,cjs}'],
				rules: {
					'no-undef': 'error',
					'no-unused-vars': ['warn', unusedVariables],
				},
			},
			{
				files: ['**/*.{ts,tsx,mts,cts}'],
				rules: {
					'no-unused-vars': ['warn', unusedVariables],
					'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
					'typescript/consistent-type-imports': [
						'warn',
						{
							prefer: 'type-imports',
							disallowTypeAnnotations: true,
							fixStyle: 'inline-type-imports',
						},
					],
					'typescript/no-misused-promises': [
						'error',
						{ checksVoidReturn: false },
					],
					'typescript/no-floating-promises': 'error',
				},
			},
			{
				files: scriptFiles,
				rules: {
					'no-restricted-imports': [
						'error',
						{
							patterns: [
								{
									group: [
										'**/tests/**',
										'**/#tests/**',
										'**/__tests__/**/*',
										'**/*.test.*',
										'**/*.spec.*',
									],
									message: 'Do not import test files in source files',
								},
							],
						},
					],
				},
			},
			{
				files: testFiles,
				rules: {
					'no-restricted-imports': 'off',
					'vitest/no-focused-tests': 'warn',
					'vitest/no-import-node-test': 'error',
					'vitest/prefer-comparison-matcher': 'error',
					'vitest/prefer-equality-matcher': 'error',
					'vitest/prefer-to-be': 'error',
					'vitest/prefer-to-contain': 'error',
					'vitest/prefer-to-have-length': 'error',
					'vitest/valid-expect-in-promise': 'error',
					'vitest/valid-expect': 'error',
				},
			},
		],
	},
	fmt: {
		semi: false,
		singleQuote: true,
		useTabs: true,
		tabWidth: 2,
		printWidth: 80,
		proseWrap: 'always',
		sortPackageJson: false,
		sortTailwindcss: {
			functions: ['clsx', 'cn', 'cva'],
			attributes: ['class', 'className', 'ngClass', '.*[cC]lassName'],
		},
		overrides: [
			{ files: ['**/package.json'], options: { useTabs: false } },
			{
				files: ['**/*.mdx'],
				options: { proseWrap: 'preserve', htmlWhitespaceSensitivity: 'ignore' },
			},
		],
		ignorePatterns: [
			'.vscode/',
			'.DS_Store',
			'node_modules/',
			'/.cache',
			'/build',
			'/server-build',
			'.agents/**',
			'.claude/**',
			'.opencode/**',
			'plop-templates/**',
			'/public/build',
			'/coverage',
			'app/styles',
			'/test-results/',
			'/playwright-report/',
			'/playwright/.cache/',
			'pnpm-lock.yaml',
			'**/mermaid-*.svg',
		],
	},
	staged: {
		'*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': [
			'vp fmt',
			'vp lint --config other/staged-lint.config.ts --no-error-on-unmatched-pattern',
		],
		'*.{json,jsonc,yml,yaml,css,less,scss,md,mdx,gql,graphql,html,vue}':
			'vp fmt',
	},
	ssr: { noExternal: ['remix-utils'] },
	plugins: lazyPlugins(() => [
		process.env.DEVTOOLS === 'true' && reactRouterDevTools(),
		reactRouter(),
		process.env.NODE_ENV === 'production' &&
			sentryVitePlugin({
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN,
			}),
		tsconfigPaths(),
	]),
	build: { sourcemap: true },
} satisfies UserConfig

export default defineConfig(toolingConfig)
