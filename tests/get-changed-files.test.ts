import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { parseGitDiff } = require('../other/get-changed-files.cjs') as {
	parseGitDiff: (output: string) => Array<{
		changeType: string
		filename: string
	}>
}

describe('changed file parsing', () => {
	it('returns both sides of a renamed content asset', () => {
		expect(
			parseGitDiff(
				'R100\tcontent/blog/old/mermaid-a.svg\tcontent/blog/new/mermaid-a.svg\n',
			),
		).toEqual([
			{
				changeType: 'moved',
				filename: 'content/blog/old/mermaid-a.svg',
			},
			{
				changeType: 'moved',
				filename: 'content/blog/new/mermaid-a.svg',
			},
		])
	})
})
