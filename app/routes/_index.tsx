import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { twJoin } from 'tailwind-merge'
import { Newsletter } from '~/components/newsletter/newsletter'
import {
	Pill,
	PILL_CLASS_NAME,
	PILL_CLASS_NAME_ACTIVE,
} from '~/components/pill'
import { H1, H2 } from '~/components/typography'
import { getQuote, getQuoteForClientSide } from '~/utils/quote.server'

export function shouldRevalidate() {
	return false
}

export async function action() {
	const quoteData = await getQuoteForClientSide()
	return {
		quoteData,
		count: 1,
	}
}

export async function loader() {
	const count = Math.floor(Math.random() * 5) + 1
	const quoteData = await getQuote({ count })
	return {
		quoteData,
		count,
	}
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>()
	const fetcher = useFetcher({ key: 'quote-fetcher' })
	const quoteData = fetcher.data?.quoteData ?? loaderData.quoteData
	const [spin, setSpin] = useState(false)

	useEffect(() => {
		let timer = setTimeout(() => {
			setSpin(false)
		}, 300)

		return () => {
			clearTimeout(timer)
		}
	}, [spin])

	return (
		// we can get rid of the svh when we actually have the newsletter
		<div className="mx-auto my-20 flex w-full max-w-screen-xl grow flex-wrap px-4 md:px-20">
			<div className="flex w-full flex-wrap justify-between">
				<article className="basis-full lg:basis-1/3">
					<H1 className="mb-6 text-center lg:text-left">Taran Bains</H1>
					<div className="flex flex-wrap justify-center gap-[100%] space-y-5 lg:block">
						<Pill>software engineer</Pill>
						<Pill>vancouver, bc</Pill>
						<Pill>7+ years experience</Pill>
						<Pill>self-taught</Pill>
						<Pill>full-stack developer</Pill>
						<Pill>typescript</Pill>
						<Pill>go</Pill>
						<a
							href="https://x.com/tearingItUp786"
							target="_blank"
							rel="noreferrer"
							className={twJoin(
								PILL_CLASS_NAME,
								PILL_CLASS_NAME_ACTIVE,
								'py-[6px] text-lg leading-6',
							)}
						>
							follow me on 𝕏
						</a>
					</div>
				</article>
				<div className="mx-auto mt-24 max-w-4xl basis-full text-center lg:basis-2/3">
					<H2 className="font-normal">{quoteData.quote}</H2>
					<p className="mt-7 text-xl font-normal italic">{quoteData.author}</p>
					<fetcher.Form method="POST">
						<input type="hidden" name="fromFetcher" value="true" />
						<button
							type="submit"
							onClick={() => {
								setSpin(true)
							}}
						>
							<span className="sr-only">Generate a new stoic quote!</span>

							<ArrowPathIcon
								role="presentation"
								className={twJoin(
									'h-8 w-8',
									(spin || fetcher.state === 'loading') &&
										'animate-spin-fast text-accent',
								)}
							/>
						</button>
					</fetcher.Form>
				</div>
			</div>
			<Newsletter />
		</div>
	)
}
