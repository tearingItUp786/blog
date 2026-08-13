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
	const relativePath = filename.replace(/^content\/blog\/?/, '')
	const [firstSegment] = relativePath.split('/')
	return firstSegment?.replace(/\.mdx?$/, '') ?? ''
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
	if (segments.length < 5) return null

	const [protocol, namespace, version, contentDir, ...slugParts] = segments
	if (protocol !== 'gql' || namespace !== 'mdx-page' || version !== 'v2') {
		return null
	}

	const slug = slugParts.join(':')
	if (!contentDir || !slug) return null
	return { contentDir, slug }
}
