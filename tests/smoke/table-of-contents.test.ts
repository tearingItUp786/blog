import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MobileTableOfContents } from '~/routes/blog.$slug/table-of-contents'
import {
	getActiveHeadingId,
	getHeadingProgress,
} from '~/routes/blog.$slug/use-active-heading'

const headings = [
	{ id: 'first', text: 'First', depth: 2 as const },
	{ id: 'second', text: 'Second', depth: 2 as const },
	{ id: 'third', text: 'Third', depth: 3 as const },
]

describe('getActiveHeadingId', () => {
	it('returns the last heading that has crossed the activation line', () => {
		expect(
			getActiveHeadingId([
				{ id: 'first', top: -240 },
				{ id: 'second', top: 80 },
				{ id: 'third', top: 420 },
			]),
		).toBe('second')
	})

	it('keeps the first heading active before the article reaches it', () => {
		expect(
			getActiveHeadingId([
				{ id: 'first', top: 360 },
				{ id: 'second', top: 720 },
			]),
		).toBe('first')
	})

	it('activates the final heading at the bottom of the page', () => {
		expect(
			getActiveHeadingId(
				[
					{ id: 'first', top: -640 },
					{ id: 'second', top: -120 },
					{ id: 'final', top: 360 },
				],
				112,
				true,
			),
		).toBe('final')
	})

	it('returns undefined when there are no headings', () => {
		expect(getActiveHeadingId([])).toBeUndefined()
	})
})

describe('getHeadingProgress', () => {
	it('reports the active heading position', () => {
		expect(getHeadingProgress(headings, 'second')).toEqual({
			current: 2,
			total: 3,
			ratio: 2 / 3,
		})
	})

	it('falls back to the first heading when the active id is unknown', () => {
		expect(getHeadingProgress(headings, 'missing')).toEqual({
			current: 1,
			total: 3,
			ratio: 1 / 3,
		})
	})

	it('returns zero progress when there are no headings', () => {
		expect(getHeadingProgress([], undefined)).toEqual({
			current: 0,
			total: 0,
			ratio: 0,
		})
	})
})

describe('MobileTableOfContents', () => {
	it('describes the active section and position in its disclosure label', () => {
		const markup = renderToStaticMarkup(
			createElement(MobileTableOfContents, {
				headings,
				activeHeadingId: 'second',
			}),
		)

		expect(markup).toContain(
			'aria-label="On this page, section 2 of 3: Second"',
		)
	})
})
