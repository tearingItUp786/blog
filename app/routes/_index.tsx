import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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

const pillContainerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.05,
		},
	},
}

const pillVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0.25, 1, 0.5, 1], // ease-out-quart
		},
	},
}

const quoteVariants = {
	enter: { opacity: 0, y: 8 },
	center: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.25,
			ease: [0.25, 1, 0.5, 1],
		},
	},
	exit: {
		opacity: 0,
		y: -8,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 1, 1], // ease-in
		},
	},
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>()
	const fetcher = useFetcher({ key: 'quote-fetcher' })
	const quoteData = fetcher.data?.quoteData ?? loaderData.quoteData
	const shouldReduceMotion = useReducedMotion()
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
					<motion.div
						className="flex flex-wrap justify-center gap-[100%] space-y-5 lg:block"
						variants={shouldReduceMotion ? undefined : pillContainerVariants}
						initial={shouldReduceMotion ? false : 'hidden'}
						animate="visible"
					>
						<motion.div
							variants={shouldReduceMotion ? undefined : pillVariants}
						>
							<Pill>software engineer</Pill>
						</motion.div>
						<motion.div
							variants={shouldReduceMotion ? undefined : pillVariants}
						>
							<Pill>vancouver, bc</Pill>
						</motion.div>
						<motion.div
							variants={shouldReduceMotion ? undefined : pillVariants}
						>
							<Pill>8+ years experience</Pill>
						</motion.div>
						<motion.div
							variants={shouldReduceMotion ? undefined : pillVariants}
						>
							<Pill>self-taught</Pill>
						</motion.div>
						<motion.div
							variants={shouldReduceMotion ? undefined : pillVariants}
						>
							<Pill>full-stack developer</Pill>
						</motion.div>
						<motion.div variants={pillVariants}>
							<Pill>typescript</Pill>
						</motion.div>
						<motion.div variants={pillVariants}>
							<Pill>go</Pill>
						</motion.div>
						<motion.div variants={pillVariants}>
							<a
								href="https://x.com/tearingItUp786"
								target="_blank"
								rel="noreferrer"
								className={twJoin(
									PILL_CLASS_NAME,
									PILL_CLASS_NAME_ACTIVE,
									'py-1.5 text-lg leading-6',
								)}
							>
								follow me on 𝕏
							</a>
						</motion.div>
					</motion.div>
				</article>
				<div className="mx-auto mt-24 max-w-4xl basis-full text-center lg:basis-2/3">
					<AnimatePresence mode="wait">
						<motion.div
							key={quoteData.quote}
							variants={quoteVariants}
							initial={false}
							animate="center"
							exit="exit"
						>
							<H2 className="font-normal">{quoteData.quote}</H2>
							<p className="mt-7 text-xl font-normal italic">
								{quoteData.author}
							</p>
						</motion.div>
					</AnimatePresence>
					<fetcher.Form method="POST">
						<input type="hidden" name="fromFetcher" value="true" />
						<button
							type="submit"
							onClick={() => {
								setSpin(true)
							}}
						>
							<span className="sr-only">Generate a new stoic quote!</span>

							<motion.span
								role="presentation"
								animate={
									spin || fetcher.state === 'loading'
										? { rotate: 360 }
										: { rotate: 0 }
								}
								transition={
									spin || fetcher.state === 'loading'
										? {
												duration: 0.5,
												type: 'spring',
												stiffness: 200,
												damping: 15,
											}
										: { duration: 0 }
								}
								className="inline-block cursor-pointer"
							>
								<ArrowPathIcon
									className={twJoin(
										'h-8 w-8',
										(spin || fetcher.state === 'loading') && 'text-accent',
									)}
								/>
							</motion.span>
						</button>
					</fetcher.Form>
				</div>
			</div>
			<Newsletter />
		</div>
	)
}
