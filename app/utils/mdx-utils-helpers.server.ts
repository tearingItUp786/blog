import {
	type GithubGraphqlObject,
	type MdxPage,
	type MdxPageAndSlug,
} from '~/schemas/github'

export function getGithubGqlObjForMdx(entry: GithubGraphqlObject) {
	if (entry?.object?.text) {
		return {
			name: entry?.name,
			files: [entry],
		}
	}
	return {
		name: entry?.name,
		files: entry?.object?.entries ?? [],
	}
}

const TAG_REGEX = /tag: (.*)/i

function getTagFromMdxText(text?: string | null) {
	return text?.match(TAG_REGEX)?.[1]?.toLowerCase()?.trim()
}

export function buildTagCounts(
	entries: GithubGraphqlObject[],
): Record<string, number> {
	return entries.reduce(
		(acc, curr) => {
			const firstMdxFile = curr?.object?.text
				? curr
				: curr?.object?.entries?.find((any) => any.name?.endsWith('.mdx'))

			if (!firstMdxFile) return acc

			const tag = getTagFromMdxText(firstMdxFile?.object?.text)

			if (!tag) return acc

			const currentCount = acc[tag] ?? 0
			acc[tag] = currentCount + 1

			return acc
		},
		{} as Record<string, number>,
	)
}

export function groupTagCountsByInitial(
	tags: Record<string, number>,
): Array<[string, Array<{ name: string; value: number }>]> {
	const tagList = Object.entries(tags).reduce(
		(acc, [name, value]) => {
			const tagObj = { name, value }

			const firstLetter = name.charAt(0).toUpperCase()
			if (!acc[firstLetter]) {
				acc[firstLetter] = []
			}
			acc[firstLetter]?.push(tagObj)

			acc[firstLetter]?.sort((a, b) =>
				new Intl.Collator().compare(a.name, b.name),
			)

			return acc
		},
		{} as Record<string, Array<{ name: string; value: number }>>,
	)

	return Object.entries(tagList).sort((a, b) =>
		new Intl.Collator().compare(a[0], b[0]),
	)
}

export function mapFromMdxPageToMdxListItem(
	page: MdxPage,
): Omit<MdxPageAndSlug, 'code'> {
	const { code, ...mdxListItem } = page
	return mdxListItem
}
