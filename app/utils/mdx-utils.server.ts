import cachified, {
	type CachifiedOptions,
	verboseReporter,
} from '@epic-web/cachified'
import {
	type GithubGraphqlObject,
	type MdxPage,
	type MdxPageAndSlug,
} from 'types'
import { queuedCompileMdxGql } from './mdx.server'
import { redisCache, redisClient } from './redis.server'
import { downloadDirGql } from '~/utils/github.server'

type CommonGetProps = {
	cachifiedOptions?: Partial<Pick<CachifiedOptions<any>, 'forceFresh' | 'key'>>
}

function getGithubGqlObjForMdx(entry: GithubGraphqlObject) {
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

async function delMdxPageGql({
	contentDir,
	slug,
}: {
	contentDir: string
	slug: string
}): Promise<any> {
	return redisClient.del(`gql:${contentDir}:${slug}`)
}

async function getMdxPageGql({
	contentDir,
	slug,
	cachifiedOptions,
}: CommonGetProps & {
	contentDir: string
	slug: string
}): Promise<MdxPage | null | void> {
	return cachified(
		{
			key: `gql:${contentDir}:${slug}`,
			cache: redisCache,
			getFreshValue: async () => {
				const pageFile = await downloadDirGql(`content/${contentDir}/${slug}`)

				const compiledPage = await queuedCompileMdxGql<MdxPage['frontmatter']>(
					`${contentDir}/${slug}`,
					pageFile.repository.object.entries ?? [],
				).catch((err) => {
					console.error(`Failed to compile mdx:`, {
						contentDir,
						slug,
					})
					return Promise.reject(err)
				})

				return compiledPage
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

// TODO: give this a better name
async function getMaxNumberOfTil({ cachifiedOptions }: CommonGetProps = {}) {
	return cachified(
		{
			key: `gql:til:max-offset`,
			cache: redisCache,
			getFreshValue: async () => {
				const dirList = await downloadDirGql(`content/til`)
				const pageData =
					dirList.repository.object?.entries?.map(getGithubGqlObjForMdx) ?? []

				// have some tils that aren't in directories
				const sanitizedPageNames = pageData.map((page) => {
					return {
						...page,
						name: page.name.replace(/\.mdx$/, ''),
					}
				})

				const sortedPageData = sanitizedPageNames.sort((a, b) => {
					return b.name.toLowerCase().localeCompare(a.name.toLowerCase(), 'en')
				})

				const chunkSize = 20
				const maxOffset = Math.ceil(pageData.length / chunkSize)
				return {
					sortedPageData,
					maxOffset,
					chunkSize,
				}
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

type TilMdxPage = MdxPageAndSlug & { offset: number }

async function getMdxTilListGql(
	{
		cachifiedOptions,
		endOffset = 1,
	}: CommonGetProps & { endOffset: number } = {
		endOffset: 1,
	},
) {
	// I need to figure out the end offset is some preposterous number
	// that we don't have
	// because we don't want the user to be able to throw in random keys

	const { sortedPageData, maxOffset, chunkSize } = await getMaxNumberOfTil({
		cachifiedOptions,
	})
	const endOffsetToUse = endOffset > maxOffset ? maxOffset : endOffset
	const startOffset = endOffsetToUse - 1

	return cachified(
		{
			key: `gql:til:list:${endOffsetToUse}`,
			cache: redisCache,
			getFreshValue: async () => {
				const pages = await Promise.all(
					sortedPageData
						.slice(startOffset * chunkSize, endOffsetToUse * chunkSize)
						.map((pageData) =>
							queuedCompileMdxGql(pageData.name, pageData.files),
						),
				).catch((err) => {
					console.error(`Failed to compile mdx for til list`)
					return Promise.reject(err)
				})

				const nonNullPages = pages
					.filter((page) => page !== null)
					.map((o) => ({
						...o,
						offset: endOffsetToUse,
					}))

				return {
					fullList: nonNullPages as TilMdxPage[],
					maxOffset,
				}
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

async function getMdxBlogListGraphql({
	cachifiedOptions,
}: CommonGetProps = {}) {
	return cachified(
		{
			key: 'gql:blog:list',
			cache: redisCache,
			getFreshValue: async () => {
				const dirList = await downloadDirGql('content/blog')
				const pageData =
					dirList.repository.object.entries
						?.sort((a, b) => {
							return b.name
								.toLowerCase()
								.localeCompare(a.name.toLowerCase(), 'en')
						})
						?.map((entry) => {
							return {
								name: entry?.name,
								files: entry?.object?.entries ?? [],
							}
						}) ?? []

				const pages = await Promise.all(
					pageData.map((pageData) =>
						queuedCompileMdxGql(pageData.name, pageData.files),
					),
				)

				const allPages = pages.map((page, i) => {
					if (!page) return null
					return {
						...mapFromMdxPageToMdxListItem(page),
						path: `blog/${pageData?.[i]?.name ?? ''}`,
					}
				}) as Omit<MdxPageAndSlug, 'code'>[]

				const draftPages = allPages.filter(
					(el) => el.frontmatter?.draft,
				) as Omit<MdxPageAndSlug, 'code'>[]

				const publishedPages = allPages.filter(
					(el) => el.frontmatter?.draft !== true,
				) as Omit<MdxPageAndSlug, 'code'>[]

				return {
					publishedPages,
					draftPages,
				}
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

async function getMdxTagListGql({ cachifiedOptions }: CommonGetProps = {}) {
	return cachified(
		{
			key: 'gql:tag:list',
			cache: redisCache,
			getFreshValue: async () => {
				// fetch all the content for til and blog from github
				// then go through the content and pluck out the tag field from the frontmatter;
				const contentDirList = await Promise.all([
					downloadDirGql('content/blog'),
					downloadDirGql('content/til'),
				])

				const contentDirListFlat = contentDirList.flatMap(
					(dir) => dir.repository.object.entries ?? [],
				)

				// get a map where the keys are the tag name, and the value is the count it shows up
				const tags = contentDirListFlat.reduce(
					(acc, curr) => {
						const firstMdxFile = curr?.object?.text
							? curr
							: curr?.object?.entries?.find((any) => any.name.endsWith('.mdx'))

						if (!firstMdxFile) return acc

						const tag = firstMdxFile?.object?.text
							?.match(/tag: (.*)/)?.[1]
							?.toLowerCase()
							?.trim()

						if (!tag) return acc

						if (acc[tag] === undefined) {
							acc[tag] = 0
						}

						const currentCount = acc[tag] ?? 0
						acc[tag] = currentCount + 1

						return acc
					},
					{} as { [key: string]: number },
				)

				// we want to create a map where the first letter
				// is the key and the value is an array
				// of objects with the name and value
				const tagList = Object.entries(tags).reduce(
					(acc, [name, value]) => {
						const tagObj = { name, value }

						const firstLetter = name.charAt(0).toUpperCase()
						if (!acc[firstLetter]) {
							acc[firstLetter] = []
						}
						acc?.[firstLetter]?.push(tagObj)

						acc?.[firstLetter]?.sort((a, b) =>
							new Intl.Collator().compare(a.name, b.name),
						)

						return acc
					},
					{} as { [key: string]: Array<{ name: string; value: number }> },
				)

				const sortedList = Object.entries(tagList).sort((a, b) =>
					new Intl.Collator().compare(a[0], b[0]),
				)

				// console.log('wtf', tags)
				return {
					tagList: sortedList,
					tags: Object.keys(tags),
				}
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

// TODO: clean this up so that it's not so repetitive
async function getMdxIndividualTagGql({
	userProvidedTag,
	cachifiedOptions,
}: CommonGetProps & { userProvidedTag: string }) {
	return cachified(
		{
			key: `gql:tag:${userProvidedTag}`,
			cache: redisCache,
			getFreshValue: async () => {
				// fetch all the content for til and blog from github
				// then go through the content and pluck out the tag field from the frontmatter;
				const getBlogList = async () => ({
					blog:
						(await downloadDirGql('content/blog'))?.repository?.object
							?.entries ?? [],
				})
				const getTilList = async () => ({
					til:
						(await downloadDirGql('content/til'))?.repository?.object
							?.entries ?? [],
				})

				const contentDirList = await Promise.all([getBlogList(), getTilList()])

				const retObject = await Promise.all(
					contentDirList.map(async (v) => {
						const [key, list] = Object.entries?.(v)?.[0] ?? []
						if (!key) throw new Error('no key for content dir list')
						if (!list) throw new Error('no value for content dir list')

						const listItemsWithTag = list
							.sort((a, b) => {
								return b.name
									.toLowerCase()
									.localeCompare(a.name.toLowerCase(), 'en')
							})
							.filter((item) => {
								const firstMdxFile = item?.object?.text
									? item
									: item?.object?.entries?.find((any) =>
											any.name.endsWith('.mdx'),
										)

								if (!firstMdxFile) return false
								// break out this regex
								const tag = firstMdxFile?.object?.text
									?.match(/tag: (.*)/)?.[1]
									?.toUpperCase()

								return tag === userProvidedTag.toUpperCase()
							})

						const retArray = await Promise.all(
							listItemsWithTag.map(async (listItem) => {
								const dataToPass = getGithubGqlObjForMdx(listItem)
								const data = await queuedCompileMdxGql(
									dataToPass.name,
									dataToPass?.files,
								)
								return {
									...data,
									slug: dataToPass.name,
								}
							}),
						)

						return retArray as Array<MdxPageAndSlug>
					}),
				)

				const blogList = retObject[0] ?? []
				const tilList = retObject[1] ?? []

				return {
					blogList,
					tilList,
					retObject,
				}
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}

function mapFromMdxPageToMdxListItem(
	page: MdxPage,
): Omit<MdxPageAndSlug, 'code'> {
	const { code, ...mdxListItem } = page
	return mdxListItem
}

export {
	getMdxPageGql,
	getMdxTilListGql,
	getMdxBlogListGraphql,
	getMdxTagListGql,
	getMdxIndividualTagGql,
	delMdxPageGql,
}
