import { useEffect } from 'react'
import { useLocation } from 'react-router'

type MermaidApi = {
	initialize: (config: {
		securityLevel: 'strict'
		startOnLoad: false
		theme: 'dark'
	}) => void
	run: (options: {
		nodes: ArrayLike<HTMLElement>
		suppressErrors: true
	}) => Promise<void>
}

let mermaidPromise: Promise<{ default: MermaidApi }> | undefined
let hasInitializedMermaid = false

function loadMermaid() {
	mermaidPromise ??= import('mermaid') as Promise<{ default: MermaidApi }>
	return mermaidPromise
}

export function MermaidRenderer() {
	const location = useLocation()

	useEffect(() => {
		let isCurrentRoute = true

		async function renderMermaidBlocks() {
			const nodes = Array.from(
				document.querySelectorAll<HTMLElement>(
					'pre.mermaid:not([data-processed])',
				),
			)

			if (!nodes.length) return

			const { default: mermaid } = await loadMermaid()

			if (!isCurrentRoute) return

			if (!hasInitializedMermaid) {
				mermaid.initialize({
					startOnLoad: false,
					theme: 'dark',
					securityLevel: 'strict',
				})
				hasInitializedMermaid = true
			}

			await mermaid.run({
				nodes,
				suppressErrors: true,
			})
		}

		void renderMermaidBlocks().catch((error: unknown) => {
			console.warn('Failed to render Mermaid diagrams', error)
		})

		return () => {
			isCurrentRoute = false
		}
	}, [location.hash, location.pathname, location.search])

	return null
}
