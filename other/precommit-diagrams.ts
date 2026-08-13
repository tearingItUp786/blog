import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { analyzeMermaidAssets } from '../app/utils/mermaid-diagrams.ts'

type StagedMdxFile = {
	path: string
	siblings: string[]
	source: string
	unstagedAssets?: string[]
}

type PrecommitDiagramAction =
	| { type: 'continue' }
	| { files: string[]; type: 'generate' }
	| { assets: string[]; type: 'review' }

export function getPrecommitDiagramAction(
	files: StagedMdxFile[],
	expectedAssetsInDirectories?: Set<string>,
): PrecommitDiagramAction {
	const filesToGenerate: string[] = []
	const assetsToReview: string[] = []

	for (const file of files) {
		const analysis = analyzeMermaidAssets(file.source, file.siblings)
		const hasOwnedOrphan = analysis.orphaned.some(
			(asset) => !expectedAssetsInDirectories?.has(asset),
		)
		if (analysis.missing.length || hasOwnedOrphan) {
			filesToGenerate.push(file.path)
		}

		for (const asset of file.unstagedAssets ?? []) {
			assetsToReview.push(path.posix.join(path.posix.dirname(file.path), asset))
		}
	}

	if (filesToGenerate.length) {
		return { files: filesToGenerate, type: 'generate' }
	}
	if (assetsToReview.length) {
		return { assets: assetsToReview, type: 'review' }
	}
	return { type: 'continue' }
}

function git(...args: string[]) {
	return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function gitRaw(...args: string[]) {
	return execFileSync('git', args, { encoding: 'utf8' })
}

function getStagedMdxFiles() {
	const output = git(
		'diff',
		'--cached',
		'--name-only',
		'--diff-filter=ACMR',
		'--',
		'content/**/*.mdx',
	)
	return output ? output.split('\n') : []
}

function getStagedDiagramFiles() {
	const output = git(
		'diff',
		'--cached',
		'--name-only',
		'--diff-filter=ACMRD',
		'--',
		'content/**/*.mdx',
		'content/**/mermaid-*.svg',
	)
	return output ? output.split('\n') : []
}

function runDeterministicCheck() {
	execFileSync('pnpm', ['diagrams:check'], { stdio: 'inherit' })
}

function getStagedFile(filePath: string) {
	return gitRaw('show', `:${filePath}`)
}

function getUnstagedGeneratedAssets(directory: string) {
	const status = gitRaw(
		'status',
		'--short',
		'--untracked-files=all',
		'--',
		`${directory}/mermaid-*.svg`,
	)
	return status
		.split('\n')
		.filter(Boolean)
		.filter((line) => line.startsWith('??') || line[1] !== ' ')
		.map((line) => path.basename(line.slice(3).trim()))
}

function getExpectedAssetsForDirectories(directories: Set<string>) {
	const expectedAssets = new Set<string>()
	for (const directory of directories) {
		for (const fileName of readdirSync(directory)) {
			if (!fileName.endsWith('.mdx')) continue
			const filePath = path.join(directory, fileName)
			const staged = git('ls-files', '--cached', '--', filePath)
			const source = staged
				? getStagedFile(filePath)
				: readFileSync(filePath, 'utf8')
			for (const diagram of analyzeMermaidAssets(source, []).diagrams) {
				expectedAssets.add(diagram.assetName)
			}
		}
	}
	return expectedAssets
}

function main() {
	const stagedDiagramFiles = getStagedDiagramFiles()
	if (!stagedDiagramFiles.length) return
	const relevantStatus = gitRaw(
		'status',
		'--short',
		'--untracked-files=all',
		'--',
		'content/**/*.mdx',
		'content/**/mermaid-*.svg',
	)
	const hasUnstagedChanges = relevantStatus
		.split('\n')
		.filter(Boolean)
		.some((line) => line.startsWith('??') || line[1] !== ' ')
	if (hasUnstagedChanges) {
		console.error(
			'Cannot validate partially staged Mermaid sources or generated SVGs. Stage the complete diagram changes first.',
		)
		process.exit(1)
	}

	const stagedPaths = getStagedMdxFiles()
	if (!stagedPaths.length) {
		try {
			runDeterministicCheck()
			return
		} catch {
			process.exit(1)
		}
	}

	const files = stagedPaths.map((filePath) => {
		const stagedSource = getStagedFile(filePath)
		const workingSource = readFileSync(filePath, 'utf8')
		if (workingSource !== stagedSource) {
			console.error(
				`Cannot generate diagrams from partially staged MDX: ${filePath}. Stage the complete file first.`,
			)
			process.exit(1)
		}

		const directory = path.dirname(filePath)
		return {
			path: filePath,
			siblings: readdirSync(directory),
			source: stagedSource,
			unstagedAssets: getUnstagedGeneratedAssets(directory),
		}
	})
	const action = getPrecommitDiagramAction(
		files,
		getExpectedAssetsForDirectories(new Set(stagedPaths.map(path.dirname))),
	)
	if (action.type === 'continue') {
		try {
			runDeterministicCheck()
			return
		} catch {
			process.exit(1)
		}
	}

	if (action.type === 'review') {
		console.error('Generated diagram assets need review and staging:')
		for (const asset of action.assets) console.error(`  ${asset}`)
		process.exit(1)
	}

	console.log(`Generating diagrams for ${action.files.join(', ')}...`)
	try {
		execFileSync('opencode', ['--version'], { stdio: 'ignore' })
		execFileSync(
			'opencode',
			['run', '--command', 'update-blog-diagrams', ...action.files],
			{ stdio: 'inherit' },
		)
		runDeterministicCheck()
	} catch {
		console.error('Diagram generation or validation failed; commit stopped.')
		process.exit(1)
	}

	console.error(
		'Diagram assets changed. Review and stage the generated/deleted SVGs, then retry the commit.',
	)
	process.exit(1)
}

if (process.env.NODE_ENV !== 'test') main()
