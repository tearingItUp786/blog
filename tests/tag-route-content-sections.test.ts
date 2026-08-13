// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type * as ReactRouter from 'react-router'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

const tagData = {
	tilList: [
		{
			slug: 'learned-a-thing',
			code: '',
			frontmatter: {
				title: 'Learned a thing',
				date: '2026-08-12',
				tag: 'react',
			},
		},
	],
	blogList: [
		{
			slug: 'a-longer-thought',
			frontmatter: {
				title: 'A longer thought',
				description: 'A blog post description',
				date: '2026-08-11',
				tag: 'react',
				hero: '/images/post.jpg',
			},
		},
	],
}

vi.mock('react-router', async (importOriginal) => {
	const actual = await importOriginal<typeof ReactRouter>()
	return {
		...actual,
		useLoaderData: () => tagData,
		useParams: () => ({ slug: 'react' }),
		useSearchParams: () => [new URLSearchParams('from=tags')],
	}
})

vi.mock('vanilla-lazyload', () => ({ default: class LazyLoad {} }))

vi.mock('~/utils/mdx-utils.server', () => ({
	getMdxIndividualTagGql: vi.fn(),
}))

vi.mock('~/utils/redis.server', () => ({ delRedisKey: vi.fn() }))

vi.mock('~/utils/til-list', () => ({
	tilMapper: (til: (typeof tagData.tilList)[number]) => ({
		...til,
		component: () => createElement('p', null, 'TIL body'),
	}),
}))

vi.mock('~/routes/til/content-card', () => ({
	ContentCard: ({
		title,
		children,
		showBlackLine,
	}: React.PropsWithChildren<{ title: string; showBlackLine?: boolean }>) =>
		createElement(
			'article',
			{
				'data-card': 'til',
				'data-timeline': showBlackLine === false ? 'off' : 'on',
			},
			title,
			children,
		),
}))

vi.mock('~/routes/blog._index/blog-card', () => ({
	BlogCard: ({ title }: { title: string }) =>
		createElement('article', { 'data-card': 'blog' }, title),
}))

describe('tag route content sections', () => {
	function enableReactActEnvironment() {
		const globalWithActEnvironment = globalThis as typeof globalThis & {
			IS_REACT_ACT_ENVIRONMENT?: boolean
		}
		const previousValue = globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT

		;(
			globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
		).IS_REACT_ACT_ENVIRONMENT = true

		return {
			[Symbol.dispose]() {
				globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = previousValue
			},
		}
	}

	it('renders a quiet archive with separate TIL and blog treatments', async () => {
		using _actEnvironment = enableReactActEnvironment()
		const { default: SingleTag } = await import('~/routes/tags.$slug')
		const container = document.createElement('div')
		document.body.append(container)
		const root = createRoot(container)

		await act(async () => {
			root.render(createElement(MemoryRouter, null, createElement(SingleTag)))
		})

		const headings = Array.from(container.querySelectorAll('h2')).map(
			(heading) => heading.textContent,
		)
		expect(headings).toEqual(['TILs', 'Blog posts'])
		expect(container.querySelectorAll('[data-card="til"]')).toHaveLength(1)
		expect(
			container
				.querySelector('[data-card="til"]')
				?.getAttribute('data-timeline'),
		).toBe('off')
		expect(container.querySelectorAll('[data-card="blog"]')).toHaveLength(1)
		expect(container.textContent).toContain('← All tags')
		expect(container.textContent).not.toContain('entries')

		act(() => root.unmount())
		container.remove()
	})
})
