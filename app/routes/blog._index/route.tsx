import {
	useLoaderData,
	type LoaderFunctionArgs,
	type MetaFunction,
	type ShouldRevalidateFunctionArgs,
} from 'react-router'
import {
	getFeaturedBlogPost,
	getPaginatedBlogList,
} from '~/utils/mdx-utils.server'
import { BlogCard } from './blog-card'
import { Pagination } from './pagination'
import { twMerge } from 'tailwind-merge'
import { H1 } from '~/components/typography'
import { Newsletter } from '~/components/newsletter/newsletter'
import { useEffect, useRef } from 'react'
import LazyLoad, { ILazyLoadInstance } from 'vanilla-lazyload'

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{
			title: `Taran "tearing it up" Bains | Blog | Blog timeline`,
		},
		{
			name: 'description',
			content: 'The blog timeline for Taran Bains',
		},
	]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const showDrafts = url.searchParams.has('showDrafts')
	const pageParam = url.searchParams.get('page')
	let page = pageParam ? parseInt(pageParam, 10) : 1

	if (isNaN(page)) {
		page = 1
	}

	// Get the featured post
	const featuredPost = await getFeaturedBlogPost({
		includeDrafts: showDrafts,
	})

	const paginatedData = await getPaginatedBlogList({
		page,
		perPage: 9,
		includeDrafts: showDrafts,
		excludeFeatured: true,
	})

	return {
		featuredPost,
		paginatedData,
		currentPage: page,
	}
}

export default function Blog() {
	const { paginatedData, featuredPost, currentPage } =
		useLoaderData<typeof loader>()
	const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)
	const { pagination } = paginatedData

	useEffect(() => {
		if (lazyLoadRef.current === null) {
			lazyLoadRef.current = new LazyLoad()
		} else {
			lazyLoadRef.current.update()
		}
	}, [pagination])

	return (
		<div
			className={twMerge(
				'relative mx-auto mb-4 mt-6 w-screen max-w-screen-xl flex-grow px-4 md:mb-10 md:mt-14 md:px-20',
			)}
		>
			<H1 className="mb-8">Blog</H1>
			<main className="grid grid-cols-4 gap-8 md:grid-cols-8 lg:grid-cols-12">
				{currentPage === 1 && featuredPost ? (
					<BlogCard
						{...featuredPost.frontmatter}
						className="col-span-full flex flex-wrap items-center overflow-clip rounded-md border border-solid border-medium-gray focus-visible:outline-2 dark:border-white"
						key={String(featuredPost.slug ?? '')}
						slug={featuredPost.path ?? ''}
					/>
				) : null}
				{paginatedData.posts.map((post) => (
					<BlogCard
						{...post.frontmatter}
						className="col-span-4 overflow-clip rounded-md border border-solid border-medium-gray focus-visible:outline-2 dark:border-white"
						key={String(post.slug ?? '')}
						slug={post.path ?? ''}
					/>
				))}
			</main>

			{/* Pagination Controls */}
			<Pagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				hasNextPage={pagination.hasNextPage}
				hasPrevPage={pagination.hasPrevPage}
				className="mt-12"
			/>

			<Newsletter noBorder />
		</div>
	)
}
