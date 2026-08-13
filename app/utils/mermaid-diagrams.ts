import { createHash } from 'node:crypto'

const GENERATED_MERMAID_ASSET_PATTERN = /^mermaid-[a-f0-9]{12}\.svg$/
const OPENING_FENCE_PATTERN =
	/^( {0,3})(`{3,}|~{3,})[ \t]*mermaid(?:[ \t].*)?$/i

export type MermaidBlock = {
	assetName: string
	index: number
	line: number
	normalizedSource: string
	source: string
}

export function normalizeMermaidSource(source: string) {
	let lines = source
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map((line) => line.replace(/[ \t]+$/g, ''))

	while (lines[0]?.trim() === '') lines.shift()
	while (lines.at(-1)?.trim() === '') lines.pop()

	const contentLines = lines.filter((line) => line.trim() !== '')
	const commonIndent = contentLines.length
		? Math.min(
				...contentLines.map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0),
			)
		: 0

	if (commonIndent > 0) {
		lines = lines.map((line) => line.slice(commonIndent))
	}

	return lines.join('\n')
}

export function getMermaidAssetName(source: string) {
	const normalizedSource = normalizeMermaidSource(source)
	const hash = createHash('sha256')
		.update(normalizedSource, 'utf8')
		.digest('hex')
		.slice(0, 12)

	return `mermaid-${hash}.svg`
}

export function extractMermaidBlocks(mdxSource: string): MermaidBlock[] {
	const lines = mdxSource.replace(/\r\n?/g, '\n').split('\n')
	const diagrams: MermaidBlock[] = []
	let outerFence: { character: string; length: number } | undefined

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		const openingLine = lines[lineIndex] ?? ''
		const anyFence = openingLine.match(/^ {0,3}(`{3,}|~{3,})/)
		if (outerFence) {
			if (
				anyFence?.[1]?.[0] === outerFence.character &&
				anyFence[1].length >= outerFence.length &&
				new RegExp(
					`^ {0,3}${outerFence.character}{${outerFence.length},}[ \\t]*$`,
				).test(openingLine)
			) {
				outerFence = undefined
			}
			continue
		}
		const openingMatch = openingLine.match(OPENING_FENCE_PATTERN)
		if (!openingMatch) {
			if (anyFence?.[1]) {
				outerFence = {
					character: anyFence[1][0] ?? '`',
					length: anyFence[1].length,
				}
			}
			continue
		}

		const fence = openingMatch[2]
		if (!fence) continue

		const fenceCharacter = fence[0]
		const closingPattern = new RegExp(
			`^ {0,3}${fenceCharacter === '`' ? '`' : '~'}{${fence.length},}[ \\t]*$`,
		)
		let closingLineIndex = lineIndex + 1

		while (
			closingLineIndex < lines.length &&
			!closingPattern.test(lines[closingLineIndex] ?? '')
		) {
			closingLineIndex += 1
		}

		if (closingLineIndex >= lines.length) continue

		const source = lines.slice(lineIndex + 1, closingLineIndex).join('\n')
		const normalizedSource = normalizeMermaidSource(source)
		diagrams.push({
			assetName: getMermaidAssetName(normalizedSource),
			index: diagrams.length,
			line: lineIndex + 1,
			normalizedSource,
			source: normalizedSource,
		})
		lineIndex = closingLineIndex
	}

	return diagrams
}

export function analyzeMermaidAssets(
	mdxSource: string,
	siblingFileNames: string[],
) {
	const diagrams = extractMermaidBlocks(mdxSource)
	const expectedAssets = new Set(diagrams.map((diagram) => diagram.assetName))
	const generatedAssets = new Set(
		siblingFileNames.filter((fileName) =>
			GENERATED_MERMAID_ASSET_PATTERN.test(fileName),
		),
	)

	return {
		diagrams,
		missing: [...expectedAssets].filter((asset) => !generatedAssets.has(asset)),
		orphaned: [...generatedAssets].filter(
			(asset) => !expectedAssets.has(asset),
		),
	}
}
