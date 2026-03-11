import { useAnimate } from 'framer-motion'
import { useEffect } from 'react'

/**
 * Handles scroll-driven card reveal without flashing above-fold content.
 *
 * Strategy:
 * - The card renders fully visible in SSR HTML (no hidden state).
 * - The IntersectionObserver fires once on mount and immediately disconnects.
 *   It classifies the card using boundingClientRect.top vs the viewport height:
 *     - top < viewport height → top edge is within the viewport → above fold
 *       → do nothing, card stays visible.
 *     - top >= viewport height → card is fully below the fold
 *       → snap to hidden instantly (off-screen, user can't see it), then
 *         set up a second observer to animate it in when it scrolls into view.
 *
 * Using boundingClientRect.top rather than isIntersecting avoids the edge case
 * where a partially-visible card (e.g. only its tag is showing) is classified
 * as intersecting and left visible, then snaps away as the user scrolls.
 */
export function useCardReveal() {
	const [scope, animate] = useAnimate()

	useEffect(() => {
		const el = scope.current
		if (!el) return

		let revealObserver: IntersectionObserver | null = null

		// One-shot observer to classify above/below fold on mount.
		const classifyObserver = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				if (!entry) return

				// Disconnect immediately — this is a one-shot classification.
				classifyObserver.disconnect()

				const viewportHeight = entry.rootBounds?.height ?? window.innerHeight
				const topIsAboveFold = entry.boundingClientRect.top < viewportHeight

				if (topIsAboveFold) {
					// Above fold — card is already visible, nothing to do.
					return
				}

				// Below fold — snap to hidden instantly (card is off-screen).
				void animate(el, { opacity: 0, y: 14 }, { duration: 0 })

				// Second observer watches for the card scrolling into view.
				revealObserver = new IntersectionObserver(
					(revealEntries) => {
						const revealEntry = revealEntries[0]
						if (!revealEntry?.isIntersecting) return

						revealObserver?.disconnect()
						void animate(
							el,
							{ opacity: 1, y: 0 },
							{ duration: 0.4, ease: [0.25, 1, 0.5, 1] },
						)
					},
					{ threshold: 0.15 },
				)

				revealObserver.observe(el)
			},
			{ threshold: 0 },
		)

		classifyObserver.observe(el)
		return () => {
			classifyObserver.disconnect()
			revealObserver?.disconnect()
		}
	}, [animate, scope])

	return scope
}
