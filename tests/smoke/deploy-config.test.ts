import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readProjectFile(filePath: string) {
	return readFileSync(path.join(root, filePath), 'utf8')
}

describe('deploy config smoke tests', () => {
	it('does not install Playwright browsers in the Docker image', () => {
		const dockerfile = readProjectFile('Dockerfile')

		expect(dockerfile).not.toContain('PLAYWRIGHT_BROWSERS_PATH')
		expect(dockerfile).not.toContain(
			'node node_modules/playwright/cli.js install chromium',
		)
		expect(dockerfile).not.toContain('pnpm exec playwright install chromium')
	})

	it('keeps Mermaid rendering browser-free at build time', () => {
		const mdxServer = readProjectFile('app/utils/mdx.server.ts')

		expect(mdxServer).toContain("strategy: 'pre-mermaid'")
		expect(mdxServer).not.toContain("strategy: 'img-svg'")
	})

	it('bounds Fly deploy time and keeps the deploy condition valid', () => {
		const deployWorkflow = readProjectFile('.github/workflows/deploy.yml')

		expect(deployWorkflow).toContain('timeout-minutes: 30')
		expect(deployWorkflow).not.toContain('}} ||')
	})
})
