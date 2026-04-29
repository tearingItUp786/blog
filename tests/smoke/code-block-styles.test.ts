import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const codeBlockStylesPath = path.join(
	process.cwd(),
	'app/styles/code-blocks.css',
)

describe('Shiki code block styles', () => {
	it('keeps highlighted backgrounds on the line wrapper only', async () => {
		const css = await readFile(codeBlockStylesPath, 'utf8')

		expect(css).toContain('pre.shiki .line.highlighted {')
		expect(css).not.toContain(
			"[data-theme='light'] pre.shiki .line.highlighted span",
		)
		expect(css).not.toContain(
			"[data-theme='dark'] pre.shiki .line.highlighted span",
		)
	})

	it('does not depend on dual-theme Shiki CSS variables', async () => {
		const css = await readFile(codeBlockStylesPath, 'utf8')

		expect(css).not.toContain('var(--shiki-light')
		expect(css).not.toContain('var(--shiki-dark')
	})

	it('collapses inter-line whitespace while preserving code indentation', async () => {
		const css = await readFile(codeBlockStylesPath, 'utf8')

		expect(css).toContain('white-space: normal;')
		expect(css).toContain('white-space: pre;')
	})
})
