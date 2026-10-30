import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { model } from './til.ts'

Deno.test('create runs Plop, records the created path, and preserves existing files', async () => {
	const root = fileURLToPath(new URL('../../', import.meta.url))
	const directory = await mkdtemp(path.join(tmpdir(), 'swamp-til-'))
	try {
		await mkdir(path.join(directory, 'other'))
		await cp(
			path.join(root, 'other/create-til.mjs'),
			path.join(directory, 'other/create-til.mjs'),
		)
		await cp(
			path.join(root, 'plopfile.cjs'),
			path.join(directory, 'plopfile.cjs'),
		)
		await cp(
			path.join(root, 'plop-templates'),
			path.join(directory, 'plop-templates'),
			{ recursive: true },
		)
		await mkdir(path.join(directory, 'content'))
		await symlink(
			path.join(root, 'node_modules'),
			path.join(directory, 'node_modules'),
			'dir',
		)
		const resources: Record<string, unknown>[] = []
		const context = {
			repoDir: directory,
			signal: new AbortController().signal,
			logger: { info() {} },
			writeResource: (
				_spec: string,
				name: string,
				data: Record<string, unknown>,
			) => {
				resources.push(data)
				return Promise.resolve({ name })
			},
		}
		const input = {
			title: 'Swamp creates a TIL',
			date: '2020-02-29',
			tag: 'tooling',
			content:
				'Swamp has a extension that helps you build your very own software factory: `stagecraft` ❤️',
			sourceUrl: 'https://github.com/swamp-club/swamp',
		}
		const result = await model.methods.create.execute(input, context)
		const createdPath =
			'content/til/2020-02-29-swamp-creates-a-til/2020-02-29-swamp-creates-a-til.mdx'
		const expectedContent =
			'Swamp has a extension that helps you build your very own software factory: `stagecraft` ❤️\n\n[Check it out](https://github.com/swamp-club/swamp)'
		assert.deepEqual(resources, [
			{ path: createdPath, ...input, content: expectedContent },
		])
		assert.deepEqual(result, { dataHandles: [{ name: 'created' }] })
		const original = await readFile(path.join(directory, createdPath), 'utf8')
		assert.equal(original.split('---\n\n')[1], `${expectedContent}\n`)
		await assert.rejects(
			model.methods.create.execute(
				{ ...input, content: 'Overwrite!' },
				context,
			),
		)
		assert.equal(resources.length, 1)
		for (const sourceUrl of [undefined, 'not a URL', 'javascript:alert(1)']) {
			await assert.rejects(
				model.methods.create.execute(
					{ ...input, sourceUrl } as unknown as Parameters<
						typeof model.methods.create.execute
					>[0],
					context,
				),
			)
		}
		assert.equal(resources.length, 1)
		assert.equal(
			await readFile(path.join(directory, createdPath), 'utf8'),
			original,
		)
		await assert.rejects(
			model.methods.create.execute({ ...input, date: '../../escape' }, context),
		)
		assert.equal(resources.length, 1)
	} finally {
		await rm(directory, { recursive: true })
	}
})
