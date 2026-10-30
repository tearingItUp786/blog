/** Generate TIL posts with the repository's existing Plop generator. @module */
import { spawn } from 'node:child_process'
import path from 'node:path'

import { z } from 'npm:zod@4.3.6'

const CreateArgs = z.object({
	title: z.string().trim().min(1),
	date: z.iso.date(),
	tag: z.string().trim().min(1),
	content: z
		.string()
		.describe(
			"The author's words, with barely any edits. Preserve wording, voice, humor, and emoji; do not paraphrase, add filler, or invent experiences. Read existing TILs for context, not to overwrite the author's voice. Supply only the body; the closing Check it out link is appended automatically.",
		),
	sourceUrl: z
		.url()
		.regex(/^https?:\/\//)
		.describe(
			"The source URL for the final Check it out link. Use the author's link or verify the relevant source; never guess a URL.",
		),
})
const CreatedPost = CreateArgs.extend({ path: z.string().min(1) })

/** Local Plop integration; requires Node and installed repository dependencies. */
export const model = {
	type: '@tearingitup786/til',
	version: '2026.10.30.2',
	globalArguments: z.object({}),
	resources: {
		post: {
			description: 'Created TIL path and supplied post content',
			schema: CreatedPost,
			lifetime: 'infinite',
			garbageCollection: 10,
		},
	},
	methods: {
		create: {
			description:
				"Create a TIL using Plop without prompts, preserving the author's words and appending a Check it out source link; never overwrite a post",
			arguments: CreateArgs,
			execute: async (
				args: z.infer<typeof CreateArgs>,
				context: {
					repoDir: string
					signal: AbortSignal
					logger: {
						info(message: string, properties?: Record<string, unknown>): void
					}
					traceHeaders?: Readonly<Record<string, string>>
					writeResource: (
						spec: string,
						name: string,
						data: Record<string, unknown>,
					) => Promise<{ name: string }>
				},
			) => {
				const parsed = CreateArgs.parse(args)
				const input = {
					...parsed,
					content: `${parsed.content}\n\n[Check it out](${parsed.sourceUrl})`,
				}
				context.logger.info('Creating TIL with Plop')
				const output = await new Promise<string>((resolve, reject) => {
					const child = spawn(
						'node',
						[path.join(context.repoDir, 'other/create-til.mjs')],
						{
							cwd: context.repoDir,
							signal: context.signal,
							env: {
								...process.env,
								...(context.traceHeaders?.traceparent
									? { TRACEPARENT: context.traceHeaders.traceparent }
									: {}),
								...(context.traceHeaders?.tracestate
									? { TRACESTATE: context.traceHeaders.tracestate }
									: {}),
							},
							stdio: ['pipe', 'pipe', 'pipe'],
						},
					)
					let stdout = ''
					let stderr = ''
					child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
						stdout += chunk
					})
					child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
						stderr += chunk
					})
					child.on('error', reject)
					child.stdin.on('error', reject)
					child.on('close', (code) => {
						if (code !== 0) {
							reject(
								new Error(
									`Plop TIL creation failed: ${
										stderr.trim() || `exit ${code}`
									}`,
								),
							)
						} else resolve(stdout)
					})
					child.stdin.end(JSON.stringify(input))
				})
				const post = CreatedPost.parse({
					...JSON.parse(output),
					sourceUrl: input.sourceUrl,
				})
				const handle = await context.writeResource('post', 'created', post)
				context.logger.info('Created TIL at {path}', { path: post.path })
				return { dataHandles: [handle] }
			},
		},
	},
}
