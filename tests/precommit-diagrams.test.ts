import { describe, expect, it } from 'vitest'

import { getPrecommitDiagramAction } from '../other/precommit-diagrams'
import { getMermaidAssetName } from '~/utils/mermaid-diagrams'

const mermaid = 'graph LR\n    A --> B'
const mdx = `\`\`\`mermaid\n${mermaid}\n\`\`\``
const assetName = getMermaidAssetName(mermaid)

describe('pre-commit diagram action', () => {
	it('does nothing when no staged MDX contains Mermaid', () => {
		expect(
			getPrecommitDiagramAction([
				{ path: 'content/blog/post/index.mdx', source: '# Text', siblings: [] },
			]),
		).toEqual({ type: 'continue' })
	})

	it('requests generation when a staged Mermaid block has no SVG', () => {
		expect(
			getPrecommitDiagramAction([
				{ path: 'content/blog/post/index.mdx', source: mdx, siblings: [] },
			]),
		).toEqual({
			files: ['content/blog/post/index.mdx'],
			type: 'generate',
		})
	})

	it('requests review when generated assets exist but have unstaged changes', () => {
		expect(
			getPrecommitDiagramAction([
				{
					path: 'content/blog/post/index.mdx',
					source: mdx,
					siblings: [assetName],
					unstagedAssets: [assetName],
				},
			]),
		).toEqual({
			assets: [`content/blog/post/${assetName}`],
			type: 'review',
		})
	})

	it('continues when current generated assets are already staged', () => {
		expect(
			getPrecommitDiagramAction([
				{
					path: 'content/blog/post/index.mdx',
					source: mdx,
					siblings: [assetName],
					unstagedAssets: [],
				},
			]),
		).toEqual({ type: 'continue' })
	})

	it('requests review when a stale generated asset deletion is unstaged', () => {
		expect(
			getPrecommitDiagramAction([
				{
					path: 'content/blog/post/index.mdx',
					source: mdx,
					siblings: [assetName],
					unstagedAssets: ['mermaid-deadbeef1234.svg'],
				},
			]),
		).toEqual({
			assets: ['content/blog/post/mermaid-deadbeef1234.svg'],
			type: 'review',
		})
	})

	it('regenerates when the old generated asset is stale', () => {
		expect(
			getPrecommitDiagramAction([
				{
					path: 'content/blog/post/index.mdx',
					source: mdx,
					siblings: ['mermaid-deadbeef1234.svg'],
				},
			]),
		).toEqual({
			files: ['content/blog/post/index.mdx'],
			type: 'generate',
		})
	})

	it('does not treat another MDX file asset in the same directory as stale', () => {
		const otherAsset = getMermaidAssetName('graph TD\n    C --> D')
		expect(
			getPrecommitDiagramAction(
				[
					{
						path: 'content/til/first.mdx',
						source: mdx,
						siblings: [assetName, otherAsset],
					},
				],
				new Set([assetName, otherAsset]),
			),
		).toEqual({ type: 'continue' })
	})
})
