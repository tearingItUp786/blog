import { twJoin } from 'cnfast'
import { useEffect, useRef } from 'react'

import { getHeadingProgress } from './use-active-heading'
import { type MdxHeading } from '~/schemas/github'

function HeadingLinks({
	headings,
	activeHeadingId,
	isCompact = false,
	showNumbers = false,
	onNavigate,
}: {
	headings: MdxHeading[]
	activeHeadingId?: string
	isCompact?: boolean
	showNumbers?: boolean
	onNavigate?: (heading: MdxHeading) => void
}) {
	return (
		<ol className="border-border-color m-0 list-none border-l p-0">
			{headings.map((heading, index) => {
				const isActive = activeHeadingId === heading.id

				return (
					<li key={heading.id} className="m-0 p-0">
						<a
							href={`#${heading.id}`}
							onClick={onNavigate ? () => onNavigate(heading) : undefined}
							aria-current={isActive ? 'location' : undefined}
							className={twJoin(
								'text-subheading-color relative flex items-center no-underline transition-colors duration-200 motion-reduce:transition-none',
								'hover:text-body focus-visible:text-body focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
								isCompact
									? 'min-h-9 py-1.5 text-sm'
									: 'min-h-11 py-2 text-base',
								heading.depth === 3
									? showNumbers
										? 'pl-7'
										: 'pl-8'
									: showNumbers
										? 'pl-3'
										: 'pl-4',
								isActive
									? 'text-body before:bg-accent before:absolute before:top-1/2 before:left-[-1px] before:h-5 before:w-0.5 before:-translate-y-1/2 before:content-[""]'
									: null,
							)}
						>
							{showNumbers ? (
								<>
									<span
										aria-hidden="true"
										className={twJoin(
											'mr-3 w-5 shrink-0 text-xs tabular-nums',
											isActive ? 'text-accent' : null,
										)}
									>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span className="min-w-0">{heading.text}</span>
								</>
							) : (
								heading.text
							)}
						</a>
					</li>
				)
			})}
		</ol>
	)
}

type TableOfContentsProps = {
	headings: MdxHeading[]
	activeHeadingId?: string
}

export function MobileTableOfContents({
	headings,
	activeHeadingId,
}: TableOfContentsProps) {
	const detailsRef = useRef<HTMLDetailsElement>(null)
	const summaryRef = useRef<HTMLElement>(null)
	const { current, total } = getHeadingProgress(headings, activeHeadingId)
	const activeHeading = headings[current - 1]

	useEffect(() => {
		const details = detailsRef.current
		if (!details) return

		const handlePointerDown = (event: PointerEvent) => {
			if (
				!details.open ||
				!(event.target instanceof Node) ||
				details.contains(event.target)
			) {
				return
			}

			details.open = false
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !details.open) return

			details.open = false
			summaryRef.current?.focus()
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	if (headings.length < 2) return null

	return (
		<div className="not-prose sticky top-0 z-20 col-span-full mt-6 mb-8 min-[1280px]:hidden lg:col-span-10 lg:col-start-2">
			<details ref={detailsRef} className="mobile-toc group relative">
				<summary
					ref={summaryRef}
					aria-label={`On this page, section ${current} of ${total}: ${activeHeading?.text}`}
					className="border-border-color bg-light-gray focus-visible:outline-accent dark:bg-dark-gray-100 flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-b px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
				>
					<span className="flex min-w-0 items-baseline gap-3">
						<span
							aria-hidden="true"
							className="text-accent w-5 shrink-0 text-sm font-bold tabular-nums"
						>
							{String(current).padStart(2, '0')}
						</span>
						<span className="text-body truncate text-sm md:text-base">
							{activeHeading?.text}
						</span>
					</span>
					<span className="flex shrink-0 items-center gap-3">
						<span className="text-subheading-color text-xs tabular-nums">
							{String(current).padStart(2, '0')}/
							{String(total).padStart(2, '0')}
						</span>
						<span
							aria-hidden="true"
							className="text-accent w-3 text-center text-base font-bold"
						>
							<span className="group-open:hidden">+</span>
							<span className="hidden group-open:inline">-</span>
						</span>
					</span>
				</summary>
				<nav
					aria-label="Table of contents"
					className="mobile-toc-panel border-border-color bg-light-gray dark:bg-dark-gray-100 absolute inset-x-0 top-full z-30 max-h-[min(42svh,20rem)] overflow-y-auto overscroll-contain border-b py-2"
				>
					<HeadingLinks
						headings={headings}
						activeHeadingId={activeHeading?.id}
						showNumbers
						onNavigate={(heading) => {
							if (detailsRef.current) detailsRef.current.open = false
							requestAnimationFrame(() => {
								const headingElement = document.getElementById(heading.id)
								headingElement?.setAttribute('tabindex', '-1')
								headingElement?.focus({ preventScroll: true })
							})
						}}
					/>
				</nav>
			</details>
		</div>
	)
}

export function DesktopTableOfContents({
	headings,
	activeHeadingId,
}: TableOfContentsProps) {
	if (headings.length < 2) return null

	return (
		<aside className="hidden min-w-0 min-[1280px]:col-start-2 min-[1280px]:row-start-1 min-[1280px]:block">
			<nav
				aria-label="Table of contents"
				className="sticky top-4 max-h-[calc(100svh-2rem)] overflow-y-auto py-1"
			>
				<p className="text-body mt-0 mb-3 text-xs font-bold tracking-[0.16em] uppercase">
					On this page
				</p>
				<HeadingLinks
					headings={headings}
					activeHeadingId={activeHeadingId}
					isCompact
				/>
			</nav>
		</aside>
	)
}
