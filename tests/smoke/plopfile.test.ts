import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

type Choice = {
	name: string
	value: string
}

type PromptConfig = {
	name: string
	type: string
	suggestOnly?: boolean
	source?: (
		answers: Record<string, unknown>,
		input?: string,
	) => Promise<Choice[]>
}

type GeneratorConfig = {
	prompts: PromptConfig[]
}

type PlopApi = {
	setPrompt: (name: string, prompt: unknown) => void
	setGenerator: (name: string, config: GeneratorConfig) => void
}

const require = createRequire(import.meta.url)
const loadPlopfile = require('../../plopfile.cjs') as (
	plop: PlopApi,
) => Promise<void> | void

async function getTagPrompt() {
	let generator: GeneratorConfig | undefined

	await loadPlopfile({
		setPrompt() {},
		setGenerator(_name, config) {
			generator = config
		},
	})

	const tagPrompt = generator?.prompts.find((prompt) => prompt.name === 'tag')

	if (!tagPrompt) {
		throw new Error('Expected the til generator to include a tag prompt')
	}

	return tagPrompt
}

describe('plopfile til generator', () => {
	it('selects an existing matching tag instead of accepting partial input', async () => {
		const tagPrompt = await getTagPrompt()

		expect(tagPrompt.type).toBe('autocomplete')
		expect(tagPrompt.suggestOnly).not.toBe(true)

		await expect(tagPrompt.source?.({}, 'coo')).resolves.toEqual(
			expect.arrayContaining([expect.objectContaining({ value: 'cool tech' })]),
		)
	})

	it('offers unmatched input as a custom tag choice', async () => {
		const tagPrompt = await getTagPrompt()

		await expect(tagPrompt.source?.({}, 'brand new tag')).resolves.toEqual([
			{
				name: 'Create new tag "brand new tag"',
				value: 'brand new tag',
			},
		])
	})
})
