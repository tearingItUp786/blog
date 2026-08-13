import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { parseGeneratedSvg } from '../app/utils/generated-svg.server.ts'
import {
	analyzeMermaidAssets,
	extractMermaidBlocks,
} from '../app/utils/mermaid-diagrams.ts'

type MissingIssue = {
	assetName: string
	diagram: number
	file: string
	line: number
	type: 'missing'
}

type AssetIssue = {
	assetName: string
	error?: string
	file: string
	type: 'invalid' | 'orphaned'
}

export type DiagramCheckIssue = MissingIssue | AssetIssue

async function walk(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true })
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(directory, entry.name)
			return entry.isDirectory() ? walk(entryPath) : [entryPath]
		}),
	)
	return files.flat()
}

function relativePath(root: string, filePath: string) {
	return path.relative(root, filePath).split(path.sep).join('/')
}

export async function checkDiagrams(root = process.cwd()) {
	const contentDirectory = path.join(root, 'content')
	const allFiles = await walk(contentDirectory)
	const mdxFiles = allFiles.filter((file) => file.endsWith('.mdx')).sort()
	const issues: DiagramCheckIssue[] = []
	const directoriesWithMdx = new Set(mdxFiles.map((file) => path.dirname(file)))
	const expectedAssetsByDirectory = new Map<string, Set<string>>()
	const sourceByMdxFile = new Map<string, string>()

	for (const mdxFile of mdxFiles) {
		const source = await readFile(mdxFile, 'utf8')
		sourceByMdxFile.set(mdxFile, source)
		const directory = path.dirname(mdxFile)
		const expectedAssets = expectedAssetsByDirectory.get(directory) ?? new Set()
		for (const diagram of extractMermaidBlocks(source)) {
			expectedAssets.add(diagram.assetName)
		}
		expectedAssetsByDirectory.set(directory, expectedAssets)
	}

	for (const mdxFile of mdxFiles) {
		const directory = path.dirname(mdxFile)
		const siblings = allFiles
			.filter((file) => path.dirname(file) === directory)
			.map((file) => path.basename(file))
		const source = sourceByMdxFile.get(mdxFile) ?? ''
		const analysis = analyzeMermaidAssets(source, siblings)

		for (const assetName of analysis.missing) {
			const diagram = extractMermaidBlocks(source).find(
				(block) => block.assetName === assetName,
			)
			if (!diagram) continue
			issues.push({
				assetName,
				diagram: diagram.index + 1,
				file: relativePath(root, mdxFile),
				line: diagram.line,
				type: 'missing',
			})
		}

		for (const diagram of analysis.diagrams) {
			if (analysis.missing.includes(diagram.assetName)) continue
			const svgPath = path.join(directory, diagram.assetName)
			const svgSource = await readFile(svgPath, 'utf8')
			const result = parseGeneratedSvg(
				svgSource,
				`${relativePath(root, mdxFile)}-${diagram.index}`,
			)
			if (!result.ok) {
				issues.push({
					assetName: diagram.assetName,
					error: result.error,
					file: relativePath(root, svgPath),
					type: 'invalid',
				})
			}
		}
	}

	for (const file of allFiles) {
		if (!/^mermaid-[a-f0-9]{12}\.svg$/.test(path.basename(file))) continue
		const directory = path.dirname(file)
		const isExpected = expectedAssetsByDirectory
			.get(directory)
			?.has(path.basename(file))
		if (!directoriesWithMdx.has(directory) || !isExpected) {
			issues.push({
				assetName: path.basename(file),
				file: relativePath(root, file),
				type: 'orphaned',
			})
		}
	}

	issues.sort((a, b) => a.file.localeCompare(b.file))
	return { issues, ok: issues.length === 0 }
}

async function main() {
	const result = await checkDiagrams()
	if (result.ok) {
		console.log('All Mermaid diagrams have current, valid generated SVGs.')
		return
	}

	for (const issue of result.issues) {
		if (issue.type === 'missing') {
			console.error(
				`Missing ${issue.assetName} for ${issue.file}:${issue.line} (diagram ${issue.diagram}).`,
			)
		} else if (issue.type === 'orphaned') {
			console.error(`Orphaned generated Mermaid SVG: ${issue.file}.`)
		} else {
			console.error(
				`Invalid generated Mermaid SVG ${issue.file}: ${issue.error}`,
			)
		}
	}
	process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
	void main()
}
