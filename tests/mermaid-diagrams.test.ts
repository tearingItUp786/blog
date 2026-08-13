import { describe, expect, it } from 'vitest'

import {
	analyzeMermaidAssets,
	extractMermaidBlocks,
	getMermaidAssetName,
	normalizeMermaidSource,
} from '~/utils/mermaid-diagrams'

describe('Mermaid diagram source', () => {
	it('creates a deterministic asset name from normalized source', () => {
		const source = `sequenceDiagram
    Actor User
    User->>Server: Request`

		expect(getMermaidAssetName(source)).toBe('mermaid-02cb4bd522b3.svg')
		expect(getMermaidAssetName(source)).toBe(getMermaidAssetName(source))
	})

	it('normalizes platform line endings and irrelevant outer whitespace', () => {
		const unix = `sequenceDiagram
    Actor User
    User->>Server: Request`
		const windows = `\r\n\tsequenceDiagram  \r\n\t    Actor User\t\r\n\t    User->>Server: Request\r\n\r\n`

		expect(normalizeMermaidSource(windows)).toBe(unix)
		expect(getMermaidAssetName(windows)).toBe(getMermaidAssetName(unix))
	})

	it('changes the asset name when diagram semantics change', () => {
		const before = `graph LR
    A --> B`
		const after = `graph LR
    A --> C`

		expect(getMermaidAssetName(after)).not.toBe(getMermaidAssetName(before))
	})

	it('extracts multiple Mermaid blocks without touching other code blocks', () => {
		const source = `# Diagrams

\`\`\`mermaid
graph LR
    A --> B
\`\`\`

\`\`\`typescript
const value = 'mermaid'
\`\`\`

~~~mermaid title="second"
sequenceDiagram
    A->>B: Hello
~~~`

		expect(extractMermaidBlocks(source)).toEqual([
			expect.objectContaining({
				index: 0,
				line: 3,
				source: 'graph LR\n    A --> B',
			}),
			expect.objectContaining({
				index: 1,
				line: 12,
				source: 'sequenceDiagram\n    A->>B: Hello',
			}),
		])
	})

	it('ignores Mermaid examples nested inside a larger code fence', () => {
		const source = `# Documentation

\`\`\`\`mdx
\`\`\`mermaid
graph LR
    A --> B
\`\`\`
\`\`\`\``

		expect(extractMermaidBlocks(source)).toEqual([])
	})
})

describe('Mermaid asset analysis', () => {
	it('requires a new SVG and marks the old hash stale after source changes', () => {
		const oldAsset = getMermaidAssetName('graph LR\n    A --> B')
		const source = `\`\`\`mermaid
graph LR
    A --> C
\`\`\``

		expect(analyzeMermaidAssets(source, [oldAsset])).toEqual({
			diagrams: [
				expect.objectContaining({
					assetName: getMermaidAssetName('graph LR\n    A --> C'),
				}),
			],
			missing: [getMermaidAssetName('graph LR\n    A --> C')],
			orphaned: [oldAsset],
		})
	})

	it('detects generated SVGs with no Mermaid source', () => {
		expect(
			analyzeMermaidAssets('# No diagrams', ['mermaid-deadbeef1234.svg']),
		).toEqual({
			diagrams: [],
			missing: [],
			orphaned: ['mermaid-deadbeef1234.svg'],
		})
	})

	it('ignores sibling SVGs outside the generated filename convention', () => {
		expect(analyzeMermaidAssets('# No diagrams', ['hero.svg'])).toEqual({
			diagrams: [],
			missing: [],
			orphaned: [],
		})
	})
})
