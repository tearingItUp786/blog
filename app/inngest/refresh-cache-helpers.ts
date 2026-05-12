import { type FileSchema } from './client'
import { replaceContent } from './utils'

export function partitionContentFiles(contentFiles: FileSchema[]) {
	const [blogFiles, tilFiles, pagesFiles] = contentFiles.reduce(
		([blog, til, pages], file) => {
			if (file.filename.startsWith('content/blog')) blog.push(file)
			else if (file.filename.startsWith('content/til')) til.push(file)
			else if (file.filename.startsWith('content/pages')) pages.push(file)
			return [blog, til, pages]
		},
		[[], [], []] as [FileSchema[], FileSchema[], FileSchema[]],
	)

	return { blogFiles, tilFiles, pagesFiles }
}

export function getBlogSlugFromContentFilename(filename: string) {
	const slug = filename.replace('content/blog', '')

	// Directory-style: /dir/index.mdx -> /dir
	// Top-level: /post.mdx -> /post
	const stripped = slug.includes('/', 1)
		? slug.replace(/\/[^/]+\.mdx?$/, '')
		: slug.replace(/\.mdx?$/, '')

	return stripped.replace(/\//g, '')
}

export function buildBlogAlgoliaObject(
	matter: { content?: string | null },
	slug: string,
) {
	return {
		...matter,
		type: 'blog',
		objectID: slug,
		content: replaceContent(String(matter?.content ?? '')),
	}
}

export function buildTilAlgoliaObject(
	matter: { content?: string | null },
	slug: string,
	offset: number,
) {
	return {
		...matter,
		type: 'til',
		offset,
		objectID: slug,
		content: replaceContent(String(matter?.content ?? '')),
	}
}

export function getRedisPageArgsFromKey(key: string) {
	const segments = key.split(':')
	if (segments.length < 3) return null
	if (segments[0] !== 'gql') return null

	const [, contentDir, ...slugParts] = segments
	const slug = slugParts.join(':')
	return { contentDir, slug }
}
