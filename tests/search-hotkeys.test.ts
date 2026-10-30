// @vitest-environment jsdom

import { HotkeysProvider, useCustomHotkeys } from '@tanstack/react-hotkeys'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
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

function UnbindSearch() {
	const { setCustomHotkey } = useCustomHotkeys()
	return createElement(
		'button',
		{ onClick: () => setCustomHotkey('search.toggle', null) },
		'Unbind',
	)
}

async function renderSearch(exclusive = false) {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	await act(async () =>
		root.render(
			createElement(
				AppHotkeysProvider,
				null,
				createElement(Search),
				createElement(UnbindSearch),
				createElement(HotkeysProvider, {
					scope: 'test-overlay',
					exclusive,
					enabled: exclusive,
					children: null,
				}),
			),
		),
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

	it('shows saved bindings and reveals a three-second hint only after a modifier tap', async () => {
		vi.useFakeTimers()
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
		expect(button.getAttribute('data-shortcut-hint')).toBe('false')
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent('keyup', { key: 'Control', bubbles: true }),
			)
		})
		const helper = view.container.querySelector(
			`#${button.getAttribute('aria-describedby')}`,
		)
		expect(helper?.textContent).toMatch(/Press.*Ctrl.*J.*to search/)
		expect(button.textContent).toContain('Search')
		await act(async () => vi.advanceTimersByTime(2999))
		expect(button.getAttribute('data-shortcut-hint')).toBe('true')
		await act(async () => vi.advanceTimersByTime(1))
		expect(button.getAttribute('data-shortcut-hint')).toBe('false')
		expect(button.hasAttribute('aria-describedby')).toBe(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('reveals the current search shortcut after a standalone Command tap on macOS', async () => {
		vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
		using view = await renderSearch()
		await press('Meta')
		expect(view.container.textContent).toMatch(/Press.*⌘.*K.*to search/)
	})

	it.each(['c', 'Tab', 'Shift'])(
		'does not reveal a hint for a modifier chord with %s',
		async (key) => {
			using view = await renderSearch()
			await act(async () =>
				document.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'Control',
						ctrlKey: true,
						bubbles: true,
					}),
				),
			)
			await press(key, { ctrlKey: true })
			await act(async () =>
				document.dispatchEvent(
					new KeyboardEvent('keyup', { key: 'Control', bubbles: true }),
				),
			)
			expect(
				view.container
					.querySelector('button')!
					.getAttribute('data-shortcut-hint'),
			).toBe('false')
		},
	)

	it('restarts the dismissal timer on a fresh tap', async () => {
		vi.useFakeTimers()
		using view = await renderSearch()
		await press('Control')
		await act(async () => vi.advanceTimersByTime(2000))
		await press('Control')
		await act(async () => vi.advanceTimersByTime(2000))
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('true')
		await act(async () => vi.advanceTimersByTime(1000))
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('false')
	})

	it.each(['blur', 'visibilitychange', 'pointerdown'])(
		'cancels pending taps on %s',
		async (event) => {
			using view = await renderSearch()
			await act(async () =>
				document.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'Control',
						ctrlKey: true,
						bubbles: true,
					}),
				),
			)
			await act(async () => {
				if (event === 'blur') window.dispatchEvent(new Event('blur'))
				else {
					if (event === 'visibilitychange')
						vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(
							'hidden',
						)
					document.dispatchEvent(new Event(event, { bubbles: true }))
				}
			})
			await act(async () =>
				document.dispatchEvent(
					new KeyboardEvent('keyup', { key: 'Control', bubbles: true }),
				),
			)
			expect(
				view.container
					.querySelector('button')!
					.getAttribute('data-shortcut-hint'),
			).toBe('false')
		},
	)

	it('hides an existing hint on blur', async () => {
		using view = await renderSearch()
		await press('Control')
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('true')
		await act(async () => window.dispatchEvent(new Event('blur')))
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('false')
	})

	it('does not reveal a shortcut suspended by an exclusive overlay', async () => {
		using view = await renderSearch(true)
		await press('Control')
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('false')
	})

	it('ignores key repeat and clears the dismissal timer on unmount', async () => {
		vi.useFakeTimers()
		{
			using view = await renderSearch()
			await press('Control', { repeat: true })
			expect(view.container.textContent).not.toContain('to search')
			await press('Control')
			expect(view.container.textContent).toContain('to search')
		}
		expect(vi.getTimerCount()).toBe(0)
		await press('Control')
		expect(vi.getTimerCount()).toBe(0)
	})

	it('dismisses the helper when search opens and suppresses it while open', async () => {
		using view = await renderSearch()
		await press('Control')
		expect(view.container.textContent).toContain('to search')
		await press('k', { ctrlKey: true })
		expect(
			view.container.querySelector('button')!.getAttribute('aria-expanded'),
		).toBe('true')
		expect(view.container.textContent).not.toContain('to search')
		await press('Control')
		expect(view.container.textContent).not.toContain('to search')
	})

	it('dismisses a hint when the search shortcut is unbound', async () => {
		using view = await renderSearch()
		await press('Control')
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('true')
		await act(async () => view.container.querySelectorAll('button')[1]!.click())
		expect(
			view.container
				.querySelector('button')!
				.getAttribute('data-shortcut-hint'),
		).toBe('false')
		await press('Control')
		expect(view.container.textContent).not.toContain('to search')
	})
})
