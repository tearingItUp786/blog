import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import matter from 'gray-matter'
import nodePlop from 'node-plop'
import { describe, expect, it } from 'vite-plus/test'

const answers = {
	title: 'Use the existing template',
	date: '2020-02-29',
	tag: 'tooling',
	content: 'A **markdown** body.\n\n```js\nconst value = "hello"\n```',
}
const relativePath =
	'content/til/2020-02-29-use-the-existing-template/2020-02-29-use-the-existing-template.mdx'

async function destination() {
	const directory = await mkdtemp(path.join(tmpdir(), 'create-til-'))
	return {
		directory,
		[Symbol.asyncDispose]: () => rm(directory, { recursive: true }),
	}
}

describe('non-interactive TIL generation', () => {
	it('uses the supplied date in both the Plop path and frontmatter', async () => {
		await using temporary = await destination()
		const { directory } = temporary
		const plop = await nodePlop(path.resolve('plopfile.cjs'), {
			destBasePath: directory,
			force: false,
		})
		const result = await plop.getGenerator('til').runActions(answers)
		expect(result.failures).toEqual([])
		expect(
			await readFile(path.join(directory, relativePath), 'utf8'),
		).toContain('date: 2020-02-29')
	})

	it('accepts JSON over stdin, reports the path, and refuses overwrites', async () => {
		await using temporary = await destination()
		const { directory } = temporary
		const run = () =>
			spawnSync(process.execPath, ['other/create-til.mjs', directory], {
				input: JSON.stringify(answers),
				encoding: 'utf8',
			})
		const first = run()
		expect(first.stderr).toBe('')
		expect(first.status).toBe(0)
		expect(JSON.parse(first.stdout)).toEqual({ path: relativePath, ...answers })
		const original = await readFile(path.join(directory, relativePath), 'utf8')
		expect(original).toContain(answers.content)
		const second = run()
		expect(second.status).toBe(1)
		expect(await readFile(path.join(directory, relativePath), 'utf8')).toBe(
			original,
		)
	})

	it.each([
		{ title: 'Node: streams', tag: 'R&D' },
		{ title: 'Using hashes # a note', tag: 'null' },
		{ title: 'true', tag: 'false' },
		{ title: 'Quotes "and" newlines\nwork', tag: 'a: b' },
	])('preserves title and tag as YAML strings: %j', async (values) => {
		await using temporary = await destination()
		const input = { ...answers, ...values }
		const result = spawnSync(
			process.execPath,
			['other/create-til.mjs', temporary.directory],
			{
				input: JSON.stringify(input),
				encoding: 'utf8',
			},
		)
		expect(result.status).toBe(0)
		const created = JSON.parse(result.stdout) as { path: string }
		const file = await readFile(
			path.join(temporary.directory, created.path),
			'utf8',
		)
		expect(matter(file).data).toMatchObject(values)
	})

	it.each([
		{ ...answers, title: '' },
		{ ...answers, date: '../../escape' },
		{ ...answers, date: '2026-02-30' },
		{ ...answers, tag: '' },
	])('rejects invalid input before generating files: %j', async (input) => {
		await using temporary = await destination()
		const result = spawnSync(
			process.execPath,
			['other/create-til.mjs', temporary.directory],
			{
				input: JSON.stringify(input),
				encoding: 'utf8',
			},
		)
		expect(result.status).toBe(1)
		expect(result.stderr).toContain('Invalid TIL input')
	})
})
