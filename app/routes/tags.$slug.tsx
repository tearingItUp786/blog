import { twJoin } from 'cnfast'
import { useEffect, useMemo, useRef } from 'react'
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	NavLink,
	type ShouldRevalidateFunctionArgs,
	useLoaderData,
	useParams,
	useSearchParams,
} from 'react-router'
import LazyLoad from 'vanilla-lazyload'
import { BlogCard } from './blog._index/blog-card'
import { ContentCard as GenericContentCard } from './til/content-card'
import { PILL_CLASS_NAME } from '~/components/pill'
import { H1, H2 } from '~/components/typography'
import { getMdxIndividualTagGql } from '~/utils/mdx-utils.server'
import { delRedisKey } from '~/utils/redis.server'
import { tilMapper } from '~/utils/til-list'

// css imports
import '~/styles/tag.css'

export function shouldRevalidate({
	currentUrl,
	nextUrl,
	defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
	if (currentUrl.pathname === nextUrl.pathname) {
		return false
	}

	return defaultShouldRevalidate
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	return [
		{ title: `Taran "tearing it up" Bains | ${params.slug}` },
		{
			name: 'description',
			content: `The articles and blog posts about ${params.slug}`,
		},
	]
}

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.slug) {
		throw new Error('No slug provided')
	}

	const data = await getMdxIndividualTagGql({
		userProvidedTag: params.slug,
	})

	if (data.tilList.length === 0 && data.blogList.length === 0) {
		console.log(`👍 no data found for ${params.slug}, redirecting to 404`)
		await delRedisKey(`gql:tag:${params.slug}`)
		// the better thing to do is to show a 404 component here
		// this redirect is just a yolo
		throw new Response('Not found', { status: 404 })
	}

	return { ...data }
}

export default function SingleTag() {
	const { blogList, tilList } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const params = useParams()

	const mountedRef = useRef(false)
	const tilComponents = useMemo(() => tilList.map(tilMapper), [tilList])

	useEffect(() => {
		if (!mountedRef.current) {
			new LazyLoad()
			mountedRef.current = true
		}
	}, [])

	return (
		<div className="relative mx-auto mt-6 mb-4 w-full max-w-screen-xl grow px-4 md:mt-14 md:mb-10 md:px-20">
			<header className="prose prose-light dark:prose-dark max-w-full wrap-break-word">
				<H1 className="w-full border-b-2 dark:border-b-white">
					Today I learned about... <br />
					<span
						className={twJoin(
							PILL_CLASS_NAME,
							'text-body mt-2 mb-4 block px-4 py-4 text-3xl font-normal uppercase',
						)}
					>
						{params.slug}
					</span>
				</H1>
				<NavLink
					prefetch="intent"
					to={'/tags?' + searchParams.toString()}
					className="text-accent inline-block text-sm font-medium no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					← All tags
				</NavLink>
			</header>

			<main className="mt-10 space-y-20 md:mb-12">
				{tilComponents.length > 0 ? (
					<section aria-labelledby="til-results-heading">
						<H2 id="til-results-heading" className="mb-6 text-xl md:text-2xl">
							TILs
						</H2>
						<div className="prose prose-light dark:prose-dark max-w-full md:max-w-5xl">
							{tilComponents.map((til) => {
								const Component = til.component
								if (!til.frontmatter) return null
								return (
									<div
										key={`${til.frontmatter.title}-${til.frontmatter.date}`}
										className="mb-16 last:mb-0 md:mb-20"
									>
										<GenericContentCard
											id={til.slug}
											titleTo={`?${searchParams.toString()}#${til.slug}`}
											title={til.frontmatter.title}
											date={til.frontmatter.date}
											tag={til.frontmatter.tag}
											showBlackLine={false}
										>
											<Component />
										</GenericContentCard>
									</div>
								)
							})}
						</div>
					</section>
				) : null}

				{blogList.length > 0 ? (
					<section aria-labelledby="blog-results-heading">
						<H2 id="blog-results-heading" className="mb-8 text-xl md:text-2xl">
							Blog posts
						</H2>
						<div className="grid grid-cols-4 gap-8 md:grid-cols-8 lg:grid-cols-12">
							{blogList.map((blog) => (
								<div
									key={`${blog.frontmatter.title}-${blog.frontmatter.date}`}
									className="col-span-full md:col-span-4 lg:col-span-6"
								>
									<BlogCard
										{...blog.frontmatter}
										className="border-medium-gray overflow-clip rounded-md border border-solid focus-visible:outline-2 dark:border-white"
										slug={`blog/${blog.slug}`}
									/>
								</div>
							))}
						</div>
					</section>
				) : null}
			</main>
		</div>
	)
}
