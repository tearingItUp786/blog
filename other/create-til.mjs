import path from 'node:path'
import { fileURLToPath } from 'node:url'

import nodePlop from 'node-plop'
import { z } from 'zod'

const inputSchema = z.object({
	title: z.string().trim().min(1),
	date: z.iso.date(),
	tag: z.string().trim().min(1),
	content: z.string(),
})

try {
	let input = ''
	for await (const chunk of process.stdin) input += chunk
	const parsed = inputSchema.safeParse(JSON.parse(input))
	if (!parsed.success)
		throw new Error(`Invalid TIL input: ${parsed.error.message}`)
	const answers = parsed.data
	const root = fileURLToPath(new URL('../', import.meta.url))
	const destination = path.resolve(process.argv[2] || root)
	const plop = await nodePlop(path.join(root, 'plopfile.cjs'), {
		destBasePath: destination,
		force: false,
	})
	const result = await plop.getGenerator('til').runActions(answers)
	if (result.failures.length) {
		throw new Error(result.failures.map((failure) => failure.error).join('\n'))
	}
	const created = result.changes[0]
	if (!created) throw new Error('Plop did not create a TIL')
	// Plop reports paths relative to its destination, with a leading slash.
	const createdPath = created.path.replace(/^[/\\]+/, '')
	process.stdout.write(JSON.stringify({ path: createdPath, ...answers }))
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error))
	process.exitCode = 1
}
