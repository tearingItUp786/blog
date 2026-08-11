import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const reactRouterPackages = [
	'react-router',
	'@react-router/express',
	'@react-router/node',
	'@react-router/serve',
	'@react-router/dev',
	'@react-router/fs-routes',
] as const

describe('React Router dependencies', () => {
	it('keeps the framework packages on the same v8 release', () => {
		const packageJson = JSON.parse(
			readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
		) as {
			dependencies: Record<string, string>
			devDependencies: Record<string, string>
		}
		const versions = reactRouterPackages.map(
			(packageName) =>
				packageJson.dependencies[packageName] ??
				packageJson.devDependencies[packageName],
		)

		expect(new Set(versions)).toEqual(new Set(['^8.3.0']))
	})

	it.each([
		['app/root.tsx', 'url.searchParams'],
		['app/routes/blog._index/route.tsx', 'url.href'],
		['app/routes/blog.$slug/route.tsx', 'url.href'],
		['app/routes/til/route.tsx', 'url.href'],
	])(
		'uses the normalized URL in %s loader routing logic',
		(filePath, normalizedUrlUsage) => {
			const source = readFileSync(path.join(process.cwd(), filePath), 'utf8')

			expect(source).toContain(normalizedUrlUsage)
			expect(source).not.toContain('request.url')
		},
	)

	it('keeps remix-utils in the Vite SSR module graph', () => {
		const viteConfig = readFileSync(
			path.join(process.cwd(), 'vite.config.ts'),
			'utf8',
		)

		expect(viteConfig).toContain("noExternal: ['remix-utils']")
	})
})
