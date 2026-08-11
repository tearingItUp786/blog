import { useEffect, useState } from 'react'

import { type MdxHeading } from '~/schemas/github'

const ACTIVE_HEADING_OFFSET = 112

type HeadingPosition = {
	id: string
	top: number
}

export function getHeadingProgress(
	headings: MdxHeading[],
	activeHeadingId?: string,
) {
	const total = headings.length
	if (total === 0) return { current: 0, total: 0, ratio: 0 }

	const activeIndex = headings.findIndex(({ id }) => id === activeHeadingId)
	const current = (activeIndex === -1 ? 0 : activeIndex) + 1

	return { current, total, ratio: current / total }
}

export function getActiveHeadingId(
	headingPositions: HeadingPosition[],
	activationOffset = ACTIVE_HEADING_OFFSET,
	isAtPageEnd = false,
) {
	if (isAtPageEnd) return headingPositions.at(-1)?.id

	let activeHeadingId = headingPositions[0]?.id

	for (const heading of headingPositions) {
		if (heading.top > activationOffset) break
		activeHeadingId = heading.id
	}

	return activeHeadingId
}

export function useActiveHeadingId(headings: MdxHeading[]) {
	const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>(
		headings[0]?.id,
	)

	useEffect(() => {
		if (headings.length < 2) return

		let animationFrameId: number | null = null

		const updateActiveHeading = () => {
			animationFrameId = null
			const headingPositions = headings.flatMap(({ id }) => {
				const heading = document.getElementById(id)
				return heading ? [{ id, top: heading.getBoundingClientRect().top }] : []
			})
			const isAtPageEnd =
				window.scrollY + window.innerHeight >=
				document.documentElement.scrollHeight - 1
			const nextActiveHeadingId = getActiveHeadingId(
				headingPositions,
				ACTIVE_HEADING_OFFSET,
				isAtPageEnd,
			)

			setActiveHeadingId((currentId) =>
				currentId === nextActiveHeadingId ? currentId : nextActiveHeadingId,
			)
		}

		const scheduleUpdate = () => {
			if (animationFrameId !== null) return
			animationFrameId = requestAnimationFrame(updateActiveHeading)
		}

		updateActiveHeading()
		window.addEventListener('scroll', scheduleUpdate, { passive: true })
		window.addEventListener('resize', scheduleUpdate)

		return () => {
			window.removeEventListener('scroll', scheduleUpdate)
			window.removeEventListener('resize', scheduleUpdate)
			if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
		}
	}, [headings])

	return activeHeadingId
}
