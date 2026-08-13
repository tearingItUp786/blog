import { describe, expect, it } from 'vitest'

import { parseGeneratedSvg } from '~/utils/generated-svg.server'

const validSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" role="img" aria-labelledby="diagram-title diagram-desc">
  <title id="diagram-title">Request path</title>
  <desc id="diagram-desc">A request moves from the user to the server.</desc>
  <defs>
    <marker id="diagram-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#eb36a1" />
    </marker>
    <linearGradient id="diagram-gradient"><stop offset="0" stop-color="#ffffff" /></linearGradient>
  </defs>
  <rect width="960" height="600" fill="url(#diagram-gradient)" />
  <path d="M 40 100 H 900" stroke="#eb36a1" stroke-dasharray="4 4" marker-end="url(#diagram-arrow)" />
  <text x="40" y="80" font-family="CommitMono, monospace">HTTP request</text>
</svg>`

describe('generated SVG parsing', () => {
	it('preserves accessibility and rewrites every local ID reference', () => {
		const result = parseGeneratedSvg(validSvg, 'blog-16-a84f72c1-0')

		expect(result.ok).toBe(true)
		if (!result.ok) return

		expect(result.svg.properties).toMatchObject({
			ariaLabelledBy: [
				'mermaid-blog-16-a84f72c1-0-diagram-title',
				'mermaid-blog-16-a84f72c1-0-diagram-desc',
			],
			className: ['generated-mermaid'],
			role: 'img',
			viewBox: '0 0 960 600',
		})
		const serialized = JSON.stringify(result.svg)
		expect(serialized).toContain('mermaid-blog-16-a84f72c1-0-diagram-title')
		expect(serialized).toContain(
			'url(#mermaid-blog-16-a84f72c1-0-diagram-arrow)',
		)
		expect(serialized).toContain(
			'url(#mermaid-blog-16-a84f72c1-0-diagram-gradient)',
		)
		expect(serialized).not.toContain('"id":"diagram-title"')
	})

	it('uses occurrence namespaces to avoid duplicate IDs on one page', () => {
		const first = parseGeneratedSvg(validSvg, 'post-deadbeef-0')
		const second = parseGeneratedSvg(validSvg, 'post-deadbeef-1')

		expect(first.ok).toBe(true)
		expect(second.ok).toBe(true)
		expect(JSON.stringify(first)).not.toBe(JSON.stringify(second))
	})

	it.each([
		[
			'script elements',
			validSvg.replace('</svg>', '<script>alert(1)</script></svg>'),
		],
		['event handlers', validSvg.replace('<rect ', '<rect onclick="alert(1)" ')],
		[
			'external links',
			validSvg
				.replace('<path ', '<a href="https://example.com"><path ')
				.replace('/></svg>', '/></a></svg>'),
		],
		['foreign objects', validSvg.replace('</svg>', '<foreignObject /></svg>')],
		['inline CSS', validSvg.replace('<rect ', '<rect style="fill:red" ')],
		[
			'CSS-escaped external URLs',
			validSvg.replace(
				'fill="#eb36a1"',
				'fill="u\\72l(https://example.com/x.svg)"',
			),
		],
		[
			'CSS image functions',
			validSvg.replace(
				'fill="#eb36a1"',
				'fill="image(https://example.com/x.svg)"',
			),
		],
	])('rejects %s', (_label, source) => {
		expect(parseGeneratedSvg(source, 'unsafe')).toMatchObject({ ok: false })
	})

	it('rejects duplicate IDs', () => {
		const source = validSvg.replace(
			'</svg>',
			'<g id="diagram-title"></g></svg>',
		)

		expect(parseGeneratedSvg(source, 'duplicate')).toEqual({
			ok: false,
			error: 'Duplicate SVG ID: diagram-title',
		})
	})

	it('rejects unresolved local references', () => {
		const source = validSvg.replace(
			'url(#diagram-arrow)',
			'url(#missing-arrow)',
		)

		expect(parseGeneratedSvg(source, 'missing')).toEqual({
			ok: false,
			error: 'SVG reference does not resolve: missing-arrow',
		})
	})

	it.each([
		['a viewBox', validSvg.replace(' viewBox="0 0 960 600"', '')],
		['role img', validSvg.replace(' role="img"', '')],
		['a title', validSvg.replace(/\s*<title[^>]*>.*?<\/title>/, '')],
		['a description', validSvg.replace(/\s*<desc[^>]*>.*?<\/desc>/, '')],
	])('requires %s', (_label, source) => {
		expect(parseGeneratedSvg(source, 'accessibility')).toMatchObject({
			ok: false,
		})
	})

	it('requires non-empty title and description references', () => {
		expect(
			parseGeneratedSvg(
				validSvg
					.replace('Request path', '')
					.replace('diagram-desc', 'other-desc'),
				'accessibility',
			),
		).toMatchObject({ ok: false })
	})

	it('rejects malformed or multiple-root SVG input', () => {
		expect(parseGeneratedSvg('<svg><title>Broken', 'malformed')).toMatchObject({
			ok: false,
		})
		expect(
			parseGeneratedSvg(`${validSvg}<svg viewBox="0 0 1 1"></svg>`, 'roots'),
		).toMatchObject({ ok: false })
	})
})
