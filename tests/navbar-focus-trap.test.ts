// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { Navbar } from '~/components/navbar/navbar'

vi.mock('~/components/theme-toggle', () => ({
	ServerThemeToggle: () =>
		createElement('button', { type: 'button' }, 'Toggle theme'),
}))

vi.mock('~/components/navbar/search', () => ({
	Search: () => createElement('button', { type: 'button' }, 'Search'),
}))

describe('mobile navbar focus trap', () => {
	beforeAll(() => {
		;(
			globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
		).IS_REACT_ACT_ENVIRONMENT = true
		vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({
			0: {} as DOMRect,
			length: 1,
			item: () => null,
			[Symbol.iterator]: () => [{} as DOMRect].values(),
		} as DOMRectList)
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}),
		)
	})

	async function renderNavbar() {
		const container = document.createElement('div')
		document.body.append(container)
		const root = createRoot(container)
		await act(async () => {
			root.render(createElement(MemoryRouter, null, createElement(Navbar)))
		})

		return {
			container,
			root,
			[Symbol.dispose]() {
				act(() => root.unmount())
				container.remove()
			},
		}
	}

	async function openMenu(container: HTMLDivElement) {
		const openButton = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Open menu"]',
		)
		expect(openButton).not.toBeNull()

		await act(async () => {
			openButton?.click()
		})

		return container.querySelector<HTMLButtonElement>(
			'button[aria-label="Close menu"]',
		)
	}

	it('moves focus to the first navigation link when opened', async () => {
		using navbar = await renderNavbar()
		await openMenu(navbar.container)

		expect(document.activeElement?.textContent).toBe('about')
	})

	it('closes on Escape and restores focus to the menu button', async () => {
		using navbar = await renderNavbar()
		await openMenu(navbar.container)

		await act(async () => {
			document.activeElement?.dispatchEvent(
				new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
			)
		})

		const closedButton = navbar.container.querySelector<HTMLButtonElement>(
			'button[aria-label="Open menu"]',
		)
		expect(closedButton?.getAttribute('aria-expanded')).toBe('false')
		expect(document.activeElement).toBe(closedButton)
	})

	it('wraps focus forward from the close button to the first link', async () => {
		using navbar = await renderNavbar()
		const closeButton = await openMenu(navbar.container)
		closeButton?.focus()

		closeButton?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }),
		)

		expect(document.activeElement?.textContent).toBe('about')
	})

	it('wraps focus backward from the first link to the close button', async () => {
		using navbar = await renderNavbar()
		const closeButton = await openMenu(navbar.container)

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				key: 'Tab',
				shiftKey: true,
			}),
		)

		expect(document.activeElement).toBe(closeButton)
	})

	it('connects the menu button to the navigation landmark', async () => {
		using navbar = await renderNavbar()
		const closeButton = await openMenu(navbar.container)
		const navigation = navbar.container.querySelector('#mobile-navigation')

		expect(closeButton?.getAttribute('aria-controls')).toBe(navigation?.id)
		expect(navigation?.getAttribute('aria-label')).toBe('Primary navigation')
	})
})
