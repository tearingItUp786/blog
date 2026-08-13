import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, onTestFinished } from 'vitest'

import { checkDiagrams } from '../other/check-diagrams'
import { getMermaidAssetName } from '~/utils/mermaid-diagrams'

async function createContentDirectory() {
	const root = await mkdtemp(path.join(os.tmpdir(), 'blog-diagrams-'))
	onTestFinished(() => rm(root, { recursive: true, force: true }))
	const postDirectory = path.join(root, 'content/blog/post')
	await mkdir(postDirectory, { recursive: true })
	return { postDirectory, root }
}

function validSvg(title = 'Diagram') {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">Description.</desc><path d="M 0 0 H 10" /></svg>`
}

describe('diagram checker', () => {
	it('reports the source file, diagram line, and expected missing asset', async () => {
		const { postDirectory, root } = await createContentDirectory()
		const mermaid = 'graph LR\n    A --> B'
		await writeFile(
			path.join(postDirectory, 'index.mdx'),
			`# Post\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n`,
		)

		const result = await checkDiagrams(root)

		expect(result.ok).toBe(false)
		expect(result.issues).toEqual([
			{
				assetName: getMermaidAssetName(mermaid),
				diagram: 1,
				file: 'content/blog/post/index.mdx',
				line: 3,
				type: 'missing',
			},
		])
	})

	it('reports orphaned generated assets after source changes', async () => {
		const { postDirectory, root } = await createContentDirectory()
		const oldAsset = getMermaidAssetName('graph LR\n    A --> B')
		await writeFile(path.join(postDirectory, 'index.mdx'), '# No diagram\n')
		await writeFile(path.join(postDirectory, oldAsset), validSvg())

		const result = await checkDiagrams(root)

		expect(result.issues).toEqual([
			{
				assetName: oldAsset,
				file: `content/blog/post/${oldAsset}`,
				type: 'orphaned',
			},
		])
	})

	it('reports malformed generated SVGs', async () => {
		const { postDirectory, root } = await createContentDirectory()
		const mermaid = 'graph LR\n    A --> B'
		const assetName = getMermaidAssetName(mermaid)
		await writeFile(
			path.join(postDirectory, 'index.mdx'),
			`\`\`\`mermaid\n${mermaid}\n\`\`\``,
		)
		await writeFile(
			path.join(postDirectory, assetName),
			'<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>',
		)

		const result = await checkDiagrams(root)

		expect(result.issues).toEqual([
			expect.objectContaining({
				assetName,
				file: `content/blog/post/${assetName}`,
				type: 'invalid',
			}),
		])
	})

	it('passes when every Mermaid block has a valid current sibling SVG', async () => {
		const { postDirectory, root } = await createContentDirectory()
		const diagrams = ['graph LR\n    A --> B', 'graph TD\n    C --> D']
		await writeFile(
			path.join(postDirectory, 'index.mdx'),
			diagrams.map((source) => `\`\`\`mermaid\n${source}\n\`\`\``).join('\n\n'),
		)
		await Promise.all(
			diagrams.map((source, index) =>
				writeFile(
					path.join(postDirectory, getMermaidAssetName(source)),
					validSvg(`Diagram ${index + 1}`),
				),
			),
		)

		expect(await checkDiagrams(root)).toEqual({ issues: [], ok: true })
	})

	it('shares generated assets safely between multiple MDX files in one directory', async () => {
		const { postDirectory, root } = await createContentDirectory()
		const first = 'graph LR\n    A --> B'
		const second = 'graph TD\n    C --> D'
		await writeFile(
			path.join(postDirectory, 'first.mdx'),
			`\`\`\`mermaid\n${first}\n\`\`\``,
		)
		await writeFile(
			path.join(postDirectory, 'second.mdx'),
			`\`\`\`mermaid\n${second}\n\`\`\``,
		)
		await writeFile(
			path.join(postDirectory, getMermaidAssetName(first)),
			validSvg('First'),
		)
		await writeFile(
			path.join(postDirectory, getMermaidAssetName(second)),
			validSvg('Second'),
		)

		expect(await checkDiagrams(root)).toEqual({ issues: [], ok: true })
	})
})
