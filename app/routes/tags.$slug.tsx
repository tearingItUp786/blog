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

import { twJoin } from 'tailwind-merge'
import LazyLoad from 'vanilla-lazyload'
import { ContentCard as GenericContentCard } from './til/content-card'
import { PILL_CLASS_NAME } from '~/components/pill'
import { H1, H3 } from '~/components/typography'
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
		<div className="relative mx-auto mb-4 mt-6 w-screen max-w-screen-xl flex-grow px-4 md:mb-10 md:mt-14 md:px-20">
			<div className="prose prose-light relative grid max-w-full grid-cols-4 break-words dark:prose-dark md:mb-12 md:grid-cols-12 md:*:col-span-12">
				<H1 className="w-full border-b-2 dark:border-b-white">
					Today I learned about... <br />
					<span
						// TODO: figure out why this is not working
						className={twJoin(
							PILL_CLASS_NAME,
							'mb-4 mt-2 block px-4 py-4 text-3xl font-normal uppercase text-body',
						)}
					>
						{params.slug}
					</span>
				</H1>
				<NavLink
					prefetch="intent"
					to={'/tags?' + searchParams.toString()}
					className="group no-underline"
				>
					<H3 className="inline group-hover:text-accent">Back to all tags</H3>
				</NavLink>
				{tilComponents.map((til, i) => {
					const Component: any = tilComponents?.[i]?.component ?? null
					if (!til?.frontmatter) return null
					return (
						<div
							key={til.frontmatter.title}
							className="mb-20 first-of-type:mt-12 last-of-type:mb-0"
						>
							<GenericContentCard
								id={til?.slug}
								titleTo={`#${til?.slug}?${searchParams.toString()}`}
								key={`${til.frontmatter.title}-${til.frontmatter.date}`}
								title={til.frontmatter.title}
								date={til.frontmatter.date}
								tag={til.frontmatter.tag}
								showBlackLine={false}
							>
								{Component ? <Component /> : null}
							</GenericContentCard>
						</div>
					)
				})}

				{blogList.map((blog) => {
					return (
						<div
							key={blog.frontmatter.title}
							className="mb-20 first-of-type:mt-12 last-of-type:mb-0"
						>
							{/* TODO: figure how a generic component can be used here */}
							<GenericContentCard
								titleTo={`/blog/${blog.slug}?${searchParams.toString()}`}
								key={`${blog.frontmatter.title}-${blog.frontmatter.date}`}
								title={blog.frontmatter.title}
								date={blog.frontmatter.date}
								tag={blog.frontmatter.tag}
								showBlackLine={false}
							>
								<H3>
									Blog post about:{' '}
									{blog.frontmatter.subtitle ??
										blog.frontmatter.description ??
										'This blog entry needs a description'}
								</H3>
							</GenericContentCard>
						</div>
					)
				})}
			</div>
		</div>
	)
}
