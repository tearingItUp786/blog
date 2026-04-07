import { useEffect, useRef, useState } from 'react'
import {
	type HeadersFunction,
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
import LazyLoad, { type ILazyLoadInstance } from 'vanilla-lazyload'
import { LineSvg } from './line-svg'
import { PreviousAndNextLinks } from './previous-and-next-links'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H1, H4 } from '~/components/typography'
import { type MdxPage } from '~/schemas/github'
import { useMdxComponent } from '~/utils/mdx-utils'
import { getMdxBlogListGraphql, getMdxPageGql } from '~/utils/mdx-utils.server'
import { dotFormattedDate, invariantResponse } from '~/utils/misc'

type LoaderData = {
	nonce: string
	page: MdxPage
	reqUrl: string
	next?: MdxPage
	prev?: MdxPage
	hasTwitterEmbed: boolean
	signOffMessage: string
}

// This document is personalized by request cookies, including the theme read
// in the root loader, so we vary on Cookie for correctness. The trade-off is
// lower browser cache hit rates as more cookies are added over time.
export const headers: HeadersFunction = ({ parentHeaders }) => {
	const headers = new Headers(parentHeaders)
	headers.set('Cache-Control', 'private, max-age=3600')
	headers.set('Vary', 'Cookie')
	return headers
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const loaderData = data as LoaderData
	const blogPostTitle =
		loaderData.page.frontmatter?.title ?? 'A single blog post'
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
				nonce: data.nonce,
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

const SIGN_OFF_MESSAGES = [
	'Appreciate you reading this.',
	'Thanks for sticking around to the end.',
	'Thanks for hanging out.',
	'Grateful you spent some time here.',
	'Hope this was worth your time.',
	'Thanks for reading. Go build something cool.',
] as const

export const loader = async ({
	params,
	request,
	context,
}: LoaderFunctionArgs) => {
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

		const signOffMessage =
			SIGN_OFF_MESSAGES[Math.floor(Math.random() * SIGN_OFF_MESSAGES.length)]

		const dataToSend: LoaderData = {
			nonce: context.cspNonce,
			page,
			prev,
			next,
			reqUrl: urlReq.origin + urlReq.pathname,
			hasTwitterEmbed: twitterStatusRegex.test(String(page?.matter?.content)),
			signOffMessage,
		}

		return data(dataToSend, { status: 200 })
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
	return (
		<div className="text-accent after:border-dark-gray-200 relative mb-4 block items-center uppercase md:flex">
			<NavLink
				className={twMerge(
					PILL_CLASS_NAME,
					PILL_CLASS_NAME_ACTIVE,
					'mr-4 mb-4 px-2 py-1 md:mb-0',
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

const decodeHashValue = (hashValue: string) => {
	try {
		return decodeURIComponent(hashValue)
	} catch {
		return hashValue
	}
}

function CopyLinkButton({ url }: { url: string }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			const textArea = document.createElement('textarea')
			textArea.value = url
			textArea.style.position = 'fixed'
			textArea.style.opacity = '0'
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={twJoin(
				PILL_CLASS_NAME,
				PILL_CLASS_NAME_ACTIVE,
				'text-accent mr-7 mb-4 cursor-pointer py-1.5 text-lg leading-6 md:mb-0',
			)}
		>
			{copied ? (
				<span className="flex items-center gap-1.5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-4 w-4"
					>
						<path
							fillRule="evenodd"
							d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
							clipRule="evenodd"
						/>
					</svg>
					Copied!
				</span>
			) : (
				<span className="flex items-center gap-1.5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-4 w-4"
					>
						<path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
						<path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" />
					</svg>
					Copy link
				</span>
			)}
		</button>
	)
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
	}, [loc.pathname, loc.search, data.hasTwitterEmbed])

	useEffect(() => {
		if (!loc.hash) return

		const headingId = decodeHashValue(loc.hash.slice(1))
		if (!headingId) return

		let settleTimeoutId: ReturnType<typeof globalThis.setTimeout>

		const scrollToHashHeading = () => {
			const heading = document.getElementById(headingId)
			if (!heading) return

			heading.scrollIntoView({ block: 'start' })

			// Some embeds can shift layout shortly after mount. One delayed re-scroll
			// keeps deep links stable without adding retry loops.
			if (data.hasTwitterEmbed) {
				settleTimeoutId = setTimeout(() => {
					heading.scrollIntoView({ block: 'start' })
				}, 120)
			}
		}

		// Wait one paint so heading nodes from MDX are present before we scroll.
		const rafId = requestAnimationFrame(scrollToHashHeading)

		return () => {
			cancelAnimationFrame(rafId)

			if (settleTimeoutId !== null) {
				clearTimeout(settleTimeoutId)
			}
		}
	}, [loc.hash, loc.pathname, data.hasTwitterEmbed])

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
			<H1 As="aside" className="mt-6 mb-4 md:mt-14 md:mb-10">
				Blog
			</H1>

			<main className="prose prose-light dark:prose-dark relative grid max-w-full grid-cols-4 break-words md:mb-12 md:grid-cols-12">
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
				<p className="text-subheading-color mt-12 mb-0 text-lg italic">
					{data.signOffMessage}
				</p>
				<div className="pt-8 pb-4 md:flex md:flex-wrap">
					<CopyLinkButton url={data.reqUrl} />

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
							'mr-7 mb-4 py-1.5 text-lg leading-6 md:mb-0',
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
							'py-1.5 text-lg leading-6',
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
					className="mt-4 mb-12 flex px-0 lg:px-24"
					previous={previous}
					next={next}
				/>
			</div>
		</div>
	)
}
