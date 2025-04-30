import { useEffect, useRef } from 'react'
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type ShouldRevalidateFunctionArgs,
	data,
	NavLink,
	useLoaderData,
	useLocation,
	useSearchParams,
} from 'react-router'
import { type ExternalScriptsHandle } from 'remix-utils/external-scripts'
import { twJoin, twMerge } from 'tailwind-merge'
import { type MdxPage } from 'types'
import LazyLoad, { type ILazyLoadInstance } from 'vanilla-lazyload'
import { LineSvg } from './line-svg'
import { PreviousAndNextLinks } from './previous-and-next-links'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H1, H4 } from '~/components/typography'
import { useMdxComponent } from '~/utils/mdx-utils'
import { getMdxBlogListGraphql, getMdxPageGql } from '~/utils/mdx-utils.server'
import { dotFormattedDate, invariantResponse } from '~/utils/misc'

import '~/styles/blog.css'

type LoaderData = {
	page: MdxPage
	reqUrl: string
	next?: MdxPage
	prev?: MdxPage
	hasTwitterEmbed: boolean
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const loaderData = data as LoaderData
	const blogPostTitle =
		loaderData.page.frontmatter?.title ?? 'A single blost post'
	return [
		{
			title: `Taran "tearing it up" Bains | Blog | ${blogPostTitle}`,
		},
		{
			name: 'description',
			content:
				loaderData.page.frontmatter?.description ??
				'A blog post by Taran Bains',
		},
	]
}

export const handle: ExternalScriptsHandle<LoaderData> = {
	scripts({ data }) {
		const externalScripts = []

		if (data?.hasTwitterEmbed) {
			externalScripts.push({
				src: 'https://platform.twitter.com/widgets.js',
				async: true,
			})
		}

		return externalScripts
	},
}

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	invariantResponse(params?.slug, 'No slug provided')

	const urlReq = new URL(request.url)
	const showDrafts = urlReq.searchParams.has('showDrafts')

	try {
		const page = await getMdxPageGql({
			contentDir: 'blog',
			slug: params.slug,
		})

		if (
			page?.frontmatter.draft &&
			process.env.NODE_ENV === 'production' &&
			!showDrafts
		) {
			throw new Error('Page is a draft')
		}

		const headers = {
			'Cache-Control': 'private, max-age=3600',
			Vary: 'Cookie',
		}

		const { publishedPages, draftPages } = await getMdxBlogListGraphql()
		const blogList =
			process.env.NODE_ENV === 'production' && !showDrafts
				? publishedPages
				: [...draftPages, ...publishedPages]

		const currentIndex = blogList.findIndex(
			(el) => el.frontmatter?.title === page?.frontmatter?.title,
		)
		const prev = blogList?.[currentIndex - 1]
		const next = blogList?.[currentIndex + 1]

		// If the content of the page contains a twitter status link, load the twitter widget script
		const twitterStatusRegex = new RegExp(
			'https://twitter\\.com/([a-zA-Z0-9_]+)/status/(\\d+)',
			'i',
		)
		if (!page) {
			throw new Response('Page not found', { status: 404 })
		}

		const dataToSend: LoaderData = {
			page,
			prev,
			next,
			reqUrl: urlReq.origin + urlReq.pathname,
			hasTwitterEmbed: twitterStatusRegex.test(String(page?.matter?.content)),
		}

		return data(dataToSend, { status: 200, headers })
	} catch (err) {
		throw data({ error: params.slug, data: { page: null } }, { status: 404 })
	}
}

const FrontmatterSubtitle = ({
	date,
	time,
	tag,
}: {
	date?: string
	time?: string
	tag?: string
}) => {
	const [searchParams] = useSearchParams()
	if (!date) return null
	console.log('👀 date', typeof date)
	return (
		<div className="after:border-gray-300 relative mb-4 block items-center uppercase text-accent md:flex">
			<NavLink
				className={twMerge(
					PILL_CLASS_NAME,
					PILL_CLASS_NAME_ACTIVE,
					'mb-4 mr-4 px-2 py-1 md:mb-0',
				)}
				to={`/tags/${tag}?${searchParams.toString()}`}
			>
				{tag}
			</NavLink>
			<span className="mr-4">{dotFormattedDate(date)}</span> •{' '}
			<span className="ml-4">{time}</span>
		</div>
	)
}

declare global {
	interface Window {
		twttr?: {
			widgets?: {
				load?: () => void
			}
		}
	}
}

export default function MdxScreen() {
	const data = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const { code, frontmatter, readTime } = data.page
	const Component = useMdxComponent(String(code))
	const loc = useLocation()
	const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)

	const tweetMessage = `I just read "${
		frontmatter!.title
	}" by @tearingItUp786 \n\n`

	useEffect(() => {
		if (lazyLoadRef.current === null) {
			lazyLoadRef.current = new LazyLoad()
		} else {
			lazyLoadRef.current.update()
		}

		if (data.hasTwitterEmbed && window.twttr) {
			// pulled from: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-loading-and-initialization
			window?.twttr?.widgets?.load?.()
		}
	}, [loc])

	const previous = data.prev
		? {
				to: data.prev.slug + `?${searchParams.toString()}`,
				title: data.prev.frontmatter?.title,
			}
		: null
	const next = data.next
		? {
				to: data.next.slug + `?${searchParams.toString()}`,
				title: data.next.frontmatter?.title,
			}
		: null

	return (
		<div className="relative mx-auto max-w-screen-xl px-4 md:px-20">
			<LineSvg />
			<H1 As="aside" className="mb-4 mt-6 md:mb-10 md:mt-14">
				Blog
			</H1>

			<main className="prose prose-light relative grid max-w-full grid-cols-4 break-words dark:prose-dark md:mb-12 md:grid-cols-12">
				<FrontmatterSubtitle
					tag={frontmatter.tag}
					time={readTime?.text}
					date={frontmatter.date}
				/>
				<div className="">
					<div className="col-span-full lg:col-span-8 lg:col-start-3">
						<H1 className="mb-4">{frontmatter.title}</H1>
						{frontmatter.subtitle ? (
							<H4 As="h2" variant="secondary" className="my-0 leading-tight">
								{frontmatter.subtitle}
							</H4>
						) : null}
					</div>
				</div>
				<Component />
				<div className="pb-4 pt-8 md:flex">
					<a
						href={`https://twitter.com/intent/tweet?${new URLSearchParams({
							url: data.reqUrl,
							text: tweetMessage,
						})}`}
						target="_blank"
						rel="noreferrer"
						className={twJoin(
							PILL_CLASS_NAME,
							PILL_CLASS_NAME_ACTIVE,
							'mb-4 mr-7 py-[6px] text-lg leading-6 md:mb-0',
						)}
					>
						Share on 𝕏
					</a>

					<a
						target="_blank"
						rel="noreferrer"
						className={twJoin(
							PILL_CLASS_NAME,
							PILL_CLASS_NAME_ACTIVE,
							'py-[6px] text-lg leading-6',
						)}
						href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams(
							{
								url: data.reqUrl,
							},
						)}`}
					>
						Share on LinkedIn
					</a>
				</div>
			</main>
			<div className="relative">
				<PreviousAndNextLinks
					className="mb-12 mt-4 flex px-0 lg:px-24"
					previous={previous}
					next={next}
				/>
			</div>
		</div>
	)
}
