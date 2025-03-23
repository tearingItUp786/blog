import { useEffect, useRef, useState } from 'react'
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	NavLink,
	type ShouldRevalidateFunctionArgs,
	useFetcher,
	useLoaderData,
} from 'react-router'
import { type TilMdxPage } from 'types'
import LazyLoad, { type ILazyLoadInstance } from 'vanilla-lazyload'
import { TilComponent } from './til-component'
import { H1 } from '~/components/typography'
import { useFooterObserver } from '~/hooks/use-footer-observer'
import { getPaginatedTilList } from '~/utils/mdx-utils.server'

// css
import '~/styles/til.css'

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

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{ title: `Taran "tearing it up" Bains | Today I Learned` },
		{
			name: 'description',
			content: 'A list of things I have learned today',
		},
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const args = new URLSearchParams(request.url.split('?')[1])
	const endOffsetParam = args.get('offset')
	const fromFetcher = args.get('fromFetcher')

	// Use a logical OR to provide a default value for endOffset
	const endOffset = Number(endOffsetParam) || 1

	// Fetch initial data to determine maxOffset
	const initialData = await getPaginatedTilList({ endOffset })
	let maxOffset = initialData.maxOffset
	const effectiveEndOffset = Math.min(endOffset, maxOffset)

	// If fromFetcher is true, return early
	if (fromFetcher) {
		return {
			fullList: initialData.fullList,
			serverEndOffset: effectiveEndOffset,
			maxOffset,
		}
	}

	// Create a list of promises for each offset
	// This will allow us to fetch all the data in parallel
	const promises = Array.from({ length: effectiveEndOffset }, (_, i) =>
		getPaginatedTilList({ endOffset: i + 1 }),
	)

	// Use Promise.all to wait for all promises and flatMap to combine the results
	// since we don't want to return an array of array's to our user
	const fullList: Array<TilMdxPage> = (await Promise.all(promises)).flatMap(
		(value) => {
			maxOffset = value.maxOffset // Update maxOffset if needed
			return value.fullList
		},
	)

	return {
		fullList,
		serverEndOffset: effectiveEndOffset,
		maxOffset,
	}
}

export default function TilPage() {
	const { fullList, maxOffset, serverEndOffset } =
		useLoaderData<typeof loader>()
	const fetcher = useFetcher<typeof loader>()
	const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)

	const [items, setItems] = useState<TilMdxPage[]>(fullList)
	const [offset, setOffset] = useState<number>(serverEndOffset)

	useFooterObserver({
		onIntersect: () => {
			if (offset === maxOffset) return
			fetcher
				.load(`/til?fromFetcher=true&offset=${offset + 1}`)
				.then(() => {
					setOffset((p) => p + 1)
				})
				.catch((err) => {
					throw err
				})
		},
	})

	useEffect(() => {
		if (lazyLoadRef.current === null) {
			lazyLoadRef.current = new LazyLoad()
		} else {
			lazyLoadRef.current.update()
		}
	}, [items])

	useEffect(() => {
		if (!fetcher.data || fetcher.state === 'loading') {
			return
		}

		if (fetcher.data) {
			setItems((prevAssets) => [
				...prevAssets,
				...(fetcher?.data?.fullList ?? []),
			])
		}
	}, [fetcher.data])

	return (
		<div className="mx-auto w-full max-w-screen-xl px-4 md:px-20">
			<div className="mb-4 mt-6 flex items-center md:mb-10 md:mt-14">
				<H1 className="">Today I Learned</H1>
				<NavLink
					target="_blank"
					prefetch="intent"
					to="/til/rss.xml"
					className="group ml-4 no-underline transition-transform duration-200 hover:scale-110"
				>
					<span className="sr-only">Get the RSS feed for Today I Learned</span>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6 md:size-10"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
						/>
					</svg>
				</NavLink>
			</div>
			<div className='relative pb-8 after:absolute after:left-[0rem] after:top-[20px] after:hidden after:h-[calc(100%_-_20px)] after:w-[2px] after:bg-gray-100 after:content-[""] after:dark:bg-white md:pl-24 after:md:block lg:px-[6.5rem] xl:min-w-[1200px]'>
				<div className="prose prose-light max-w-full dark:prose-dark">
					{items?.map((til) => {
						return (
							<TilComponent
								key={`${til.frontmatter.title}-${til.frontmatter.date}`}
								til={til}
							/>
						)
					})}
				</div>
			</div>
		</div>
	)
}
