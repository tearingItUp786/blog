import { describe, expect, it } from 'vitest'

import {
	buildBlogAlgoliaObject,
	buildTilAlgoliaObject,
	getBlogSlugFromContentFilename,
	getRedisPageArgsFromKey,
	partitionContentFiles,
} from '~/inngest/refresh-cache-helpers'

const makeFileSchema = (filename: string, changeType: string = 'modified') => ({
	filename,
	changeType: changeType as 'modified' | 'added' | 'deleted' | 'moved',
})

describe('partitionContentFiles', () => {
	it('splits content files into blog, til, and pages buckets', () => {
		const files = [
			makeFileSchema('content/blog/20-perf/index.mdx'),
			makeFileSchema('content/til/2026-01-01/post.mdx'),
			makeFileSchema('content/pages/uses/index.mdx'),
			makeFileSchema('content/blog/19-css/index.mdx'),
		]
		const { blogFiles, tilFiles, pagesFiles } = partitionContentFiles(files)
		expect(blogFiles).toEqual([files[0], files[3]])
		expect(tilFiles).toEqual([files[1]])
		expect(pagesFiles).toEqual([files[2]])
	})

	it('returns empty arrays when no content files present', () => {
		const { blogFiles, tilFiles, pagesFiles } = partitionContentFiles([])
		expect(blogFiles).toEqual([])
		expect(tilFiles).toEqual([])
		expect(pagesFiles).toEqual([])
	})

	it('handles files in unknown directories by excluding them', () => {
		const files = [
			makeFileSchema('content/blog/post.mdx'),
			makeFileSchema('other/script.mjs'),
		]
		const { blogFiles, tilFiles, pagesFiles } = partitionContentFiles(files)
		expect(blogFiles).toEqual([files[0]])
		expect(tilFiles).toEqual([])
		expect(pagesFiles).toEqual([])
	})
})

describe('getBlogSlugFromContentFilename', () => {
	it('extracts slug from a blog content path', () => {
		expect(
			getBlogSlugFromContentFilename(
				'content/blog/20-web-performance-fundamentals/index.mdx',
			),
		).toBe('20-web-performance-fundamentals')
	})

	it('extracts slug from a top-level blog mdx file', () => {
		expect(
			getBlogSlugFromContentFilename('content/blog/some-standalone-post.mdx'),
		).toBe('some-standalone-post')
	})

	it('works for deleted and moved files too', () => {
		expect(
			getBlogSlugFromContentFilename(
				'content/blog/07-canadian-mortgages/index.mdx',
			),
		).toBe('07-canadian-mortgages')
	})
})

describe('buildBlogAlgoliaObject', () => {
	it('sets type, objectID, and stripped content', () => {
		const result = buildBlogAlgoliaObject(
			{ content: '<p>Hello <strong>world</strong></p>' },
			'my-slug',
		)
		expect(result.type).toBe('blog')
		expect(result.objectID).toBe('my-slug')
		expect(result.content).toBe('Hello world')
	})
})

describe('buildTilAlgoliaObject', () => {
	it('sets type, offset, objectID, and stripped content', () => {
		const result = buildTilAlgoliaObject(
			{ content: '<p>TIL something</p>' },
			'til-slug',
			3,
		)
		expect(result.type).toBe('til')
		expect(result.objectID).toBe('til-slug')
		expect(result.offset).toBe(3)
		expect(result.content).toBe('TIL something')
	})
})

describe('getRedisPageArgsFromKey', () => {
	it('parses a valid gql key into contentDir and slug', () => {
		expect(
			getRedisPageArgsFromKey('gql:blog:20-web-performance-fundamentals'),
		).toEqual({ contentDir: 'blog', slug: '20-web-performance-fundamentals' })
	})

	it('parses pages keys correctly', () => {
		expect(getRedisPageArgsFromKey('gql:pages:uses')).toEqual({
			contentDir: 'pages',
			slug: 'uses',
		})
	})

	it('returns null for keys with fewer than 3 segments', () => {
		expect(getRedisPageArgsFromKey('gql:blog')).toBeNull()
	})

	it('returns null for keys without expected prefix', () => {
		expect(getRedisPageArgsFromKey('home:some-key')).toBeNull()
	})
})
