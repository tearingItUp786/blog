import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

// Exercise the hook itself; only the external command boundary is substituted.
function runHook(diagramStatus = 0) {
	const directory = mkdtempSync(path.join(os.tmpdir(), 'blog-hook-'))
	try {
		const log = path.join(directory, 'commands')
		for (const command of ['pnpm', 'npx']) {
			writeFileSync(
				path.join(directory, command),
				`#!/bin/sh\nprintf '%s\\n' "${command} $*" >> "$COMMAND_LOG"\nif [ "$1" = 'diagrams:precommit' ]; then exit "$DIAGRAM_STATUS"; fi\n`,
				{ mode: 0o755 },
			)
		}
		writeFileSync(log, '')
		const result = spawnSync('sh', ['-e', '.husky/pre-commit'], {
			encoding: 'utf8',
			env: {
				...process.env,
				PATH: `${directory}${path.delimiter}${process.env.PATH}`,
				COMMAND_LOG: log,
				DIAGRAM_STATUS: String(diagramStatus),
			},
		})
		return {
			status: result.status,
			commands: readFileSync(log, 'utf8').trim().split('\n'),
		}
	} finally {
		rmSync(directory, { recursive: true, force: true })
	}
}

describe('developer commit hook', () => {
	it('runs only the diagram gate followed by project-local staged checks', () => {
		expect(runHook()).toEqual({
			status: 0,
			commands: ['pnpm diagrams:precommit', 'pnpm exec vp staged'],
		})
	})

	it('does not format or restage anything when diagrams require review', () => {
		expect(runHook(1)).toEqual({
			status: 1,
			commands: ['pnpm diagrams:precommit'],
		})
	})
})

describe('developer quality gates', () => {
	it('keeps framework builds and the mock-enabled development entrypoint', () => {
		const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as {
			scripts: Record<string, string>
		}
		expect(scripts.dev).toBe('node ./server/dev-server.mjs')
		expect(scripts.build).toBe('react-router build')
	})

	it('runs full checks for every pull request without a path filter', () => {
		const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
		expect(workflow).toMatch(/pull_request:/)
		expect(workflow).not.toMatch(/paths(?:-ignore)?:|DEPLOYABLE/)
		for (const command of ['check', 'test', 'diagrams:check']) {
			expect(workflow).toContain(`pnpm run ${command}`)
		}
		expect(workflow).toContain('pnpm install --frozen-lockfile')
	})
})

function withStagedRepository(
	check: (fixture: {
		directory: string
		git: (...args: string[]) => string
		staged: () => SpawnSyncReturns<string>
	}) => void,
) {
	const directory = mkdtempSync(path.join(os.tmpdir(), 'blog-staged-'))
	const root = process.cwd()
	const git = (...args: string[]) => {
		const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' })
		if (result.status !== 0) throw new Error(result.stderr)
		return result.stdout
	}
	try {
		mkdirSync(path.join(directory, 'other'))
		symlinkSync(
			path.join(root, 'node_modules'),
			path.join(directory, 'node_modules'),
			'dir',
		)
		copyFileSync('vite.config.ts', path.join(directory, 'vite.config.ts'))
		copyFileSync(
			'other/staged-lint.config.ts',
			path.join(directory, 'other/staged-lint.config.ts'),
		)
		writeFileSync(path.join(directory, 'package.json'), '{"type":"module"}\n')
		writeFileSync(path.join(directory, '.gitignore'), 'node_modules\n')
		git('init', '--quiet')
		git('add', '.')
		git(
			'-c',
			'user.name=Hook test',
			'-c',
			'user.email=hook@example.test',
			'commit',
			'--quiet',
			'--no-verify',
			'-m',
			'fixture',
		)
		check({
			directory,
			git,
			staged: () =>
				spawnSync(
					process.execPath,
					[path.join(root, 'node_modules/vite-plus/bin/vp'), 'staged'],
					{
						cwd: directory,
						encoding: 'utf8',
						timeout: 30000,
						env: {
							...process.env,
							PATH: `${path.join(root, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
						},
					},
				),
		})
	} finally {
		rmSync(directory, { recursive: true, force: true })
	}
}

describe('real staged-file checks', () => {
	it('allows test files to import other test helpers', () => {
		withStagedRepository(({ directory, git, staged }) => {
			mkdirSync(path.join(directory, 'tests'))
			writeFileSync(
				path.join(directory, 'tests/helper.ts'),
				'export const value = 1\n',
			)
			writeFileSync(
				path.join(directory, 'tests/subject.test.ts'),
				"import { value } from '../tests/helper'\nexport const result = value\n",
			)
			git('add', '--', 'tests')
			expect(staged().status).toBe(0)
		})
	}, 30000)

	it('formats spaced paths without staging the developer’s unstaged edits', () => {
		withStagedRepository(({ directory, git, staged }) => {
			const name = 'a spaced file.ts'
			writeFileSync(
				path.join(directory, name),
				'export const stagedValue="stage";\n',
			)
			git('add', '--', name)
			writeFileSync(
				path.join(directory, name),
				'export const stagedValue="stage";\n\nexport const unstagedValue = "private";\n',
			)
			const result = staged()
			expect(result.status).toBe(0)
			expect(git('show', `:${name}`)).toBe(
				"export const stagedValue = 'stage'\n",
			)
			expect(readFileSync(path.join(directory, name), 'utf8')).toContain(
				'unstagedValue',
			)
		})
	}, 30000)

	it('succeeds for unsupported staged assets without running project checks', () => {
		withStagedRepository(({ directory, git, staged }) => {
			writeFileSync(path.join(directory, 'asset.svg'), '<svg/>')
			git('add', '--', 'asset.svg')
			expect(staged().status).toBe(0)
			expect(git('show', ':asset.svg')).toBe('<svg/>')
		})
	}, 30000)

	it('rejects a lint error and restores the original staged content', () => {
		withStagedRepository(({ directory, git, staged }) => {
			const source = 'export const missing=notDefined;\n'
			writeFileSync(path.join(directory, 'invalid.js'), source)
			git('add', '--', 'invalid.js')
			const result = staged()
			expect(result.status).not.toBe(0)
			expect(String(result.stdout) + String(result.stderr)).toContain(
				'no-undef',
			)
			expect(git('show', ':invalid.js')).toBe(source)
			expect(readFileSync(path.join(directory, 'invalid.js'), 'utf8')).toBe(
				source,
			)
		})
	}, 30000)
})
