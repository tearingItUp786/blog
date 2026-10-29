// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppHotkeysProvider } from '~/components/hotkeys/provider'
import { Search } from '~/components/navbar/search'

// Replace the remote Algolia adapter, not the Search keyboard/state logic.
vi.mock('~/components/navbar/search-wrapper', async () => {
	const { useEffect } = await import('react')
	return {
		default: function SearchAdapter({
			searchRef,
			setOnMount,
			onOpenChange,
		}: {
			searchRef: { current: unknown }
			setOnMount: () => void
			onOpenChange: (open: boolean) => void
		}) {
			useEffect(() => {
				searchRef.current = {
					setIsOpen: (open: boolean) => onOpenChange?.(open),
				}
				setOnMount()
			}, [searchRef, setOnMount, onOpenChange])
			return null
		},
	}
})

async function renderSearch() {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	await act(async () =>
		root.render(createElement(AppHotkeysProvider, null, createElement(Search))),
	)
	return {
		container,
		[Symbol.dispose]() {
			act(() => root.unmount())
			container.remove()
		},
	}
}

async function press(key: string, modifiers: KeyboardEventInit = {}) {
	await act(async () => {
		document.dispatchEvent(
			new KeyboardEvent('keydown', {
				key,
				bubbles: true,
				cancelable: true,
				...modifiers,
			}),
		)
		document.dispatchEvent(
			new KeyboardEvent('keyup', { key, bubbles: true, ...modifiers }),
		)
	})
}

describe('search keyboard integration', () => {
	beforeAll(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }))
	beforeEach(() => localStorage.clear())

	it('shows the platform binding rather than a hardcoded Command symbol', async () => {
		using view = await renderSearch()
		expect(
			view.container.querySelector('button')!.getAttribute('aria-label'),
		).toMatch(/Search.*Ctrl.*K/)
	})

	it('keeps one toggle owner across lazy loading, dismissal, and reopening', async () => {
		using view = await renderSearch()
		const button = view.container.querySelector('button')!
		await press('k', { ctrlKey: true })
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 350))
		})
		expect(button.getAttribute('aria-expanded')).toBe('true')
		await press('k', { ctrlKey: true })
		expect(button.getAttribute('aria-expanded')).toBe('false')
		await press('k', { ctrlKey: true })
		expect(button.getAttribute('aria-expanded')).toBe('true')
		await press('Escape')
		expect(button.getAttribute('aria-expanded')).toBe('false')
	})

	it('shows saved bindings and reveals a hint while their modifier is held', async () => {
		localStorage.setItem(
			'blog:hotkeys:v1',
			JSON.stringify({ 'search.toggle': 'Mod+J' }),
		)
		using view = await renderSearch()
		const button = view.container.querySelector('button')!
		expect(button.getAttribute('aria-label')).toMatch(/Ctrl.*J/)
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Control',
					ctrlKey: true,
					bubbles: true,
				}),
			)
		})
		expect(button.getAttribute('data-shortcut-hint')).toBe('true')
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent('keyup', { key: 'Control', bubbles: true }),
			)
		})
		expect(button.getAttribute('data-shortcut-hint')).toBe('false')
	})
})
