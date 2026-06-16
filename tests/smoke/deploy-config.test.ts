import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readProjectFile(filePath: string) {
	return readFileSync(path.join(root, filePath), 'utf8')
}

describe('deploy config smoke tests', () => {
	it('keeps Playwright browser install in a cacheable Docker layer', () => {
		const dockerfile = readProjectFile('Dockerfile')
		const prodModulesCopy = dockerfile.indexOf(
			'COPY --from=prod-deps /app/node_modules /app/node_modules',
		)
		const playwrightInstall = dockerfile.indexOf(
			'RUN pnpm exec playwright install chromium',
		)
		const finalSourceCopy = dockerfile.lastIndexOf('COPY . .')

		expect(prodModulesCopy).toBeGreaterThan(-1)
		expect(playwrightInstall).toBeGreaterThan(prodModulesCopy)
		expect(playwrightInstall).toBeLessThan(finalSourceCopy)
	})

	it('bounds Fly deploy time and keeps the deploy condition valid', () => {
		const deployWorkflow = readProjectFile('.github/workflows/deploy.yml')

		expect(deployWorkflow).toContain('timeout-minutes: 30')
		expect(deployWorkflow).not.toContain('}} ||')
	})
})
