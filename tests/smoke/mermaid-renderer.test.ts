import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readProjectFile(filePath: string) {
	const fullPath = path.join(root, filePath)
	return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : ''
}

describe('browser Mermaid rendering', () => {
	it('declares Mermaid as a direct dependency', () => {
		const packageJson = JSON.parse(readProjectFile('package.json')) as {
			dependencies?: Record<string, string>
		}

		expect(packageJson.dependencies?.mermaid).toBe('11.10.0')
	})

	it('mounts the browser renderer once from the root route', () => {
		const rootRoute = readProjectFile('app/root.tsx')

		expect(rootRoute).toContain(
			"import { MermaidRenderer } from './components/mermaid-renderer'",
		)
		expect(rootRoute).toContain('<MermaidRenderer />')
	})

	it('loads Mermaid only for unprocessed pre-mermaid blocks', () => {
		const renderer = readProjectFile('app/components/mermaid-renderer.tsx')

		expect(renderer).toContain('useLocation')
		expect(renderer).toContain('querySelectorAll')
		expect(renderer).toContain('pre.mermaid:not([data-processed])')
		expect(renderer).toContain("import('mermaid')")
		expect(renderer).not.toContain("from 'mermaid'")
		expect(renderer).toContain('startOnLoad: false')
		expect(renderer).toContain("securityLevel: 'strict'")
		expect(renderer).toContain('suppressErrors: true')
	})

	it('styles source and rendered Mermaid diagrams', () => {
		const css = readProjectFile('app/styles/app.css')

		expect(css).toContain('pre.mermaid')
		expect(css).toContain('pre.mermaid[data-processed] svg')
		expect(css).toContain('overflow-x: auto')
	})
})
