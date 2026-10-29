// @vitest-environment jsdom

import { useAppHotkeys, useHotkey } from '@tanstack/react-hotkeys'
import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { KeyboardShortcuts } from '~/components/hotkeys/keyboard-shortcuts'
import { AppHotkeysProvider } from '~/components/hotkeys/provider'

const storageKey = 'blog:hotkeys:v1'

function SearchCommand() {
	const hotkeys = useAppHotkeys()
	const [count, setCount] = useState(0)
	useHotkey(hotkeys['search.toggle'], () => setCount((value) => value + 1))
	useHotkey('Mod+L', () => {}, { scope: 'test-conflict' })
	return createElement('output', null, count)
}

async function renderShortcuts() {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	await act(async () => {
		root.render(
			createElement(
				AppHotkeysProvider,
				null,
				createElement(SearchCommand),
				createElement('input'),
				createElement(KeyboardShortcuts),
			),
		)
	})
	return {
		container,
		[Symbol.dispose]() {
			act(() => root.unmount())
			container.remove()
		},
	}
}

async function press(
	key: string,
	ctrlKey = false,
	target: EventTarget = document,
) {
	await act(async () => {
		target.dispatchEvent(
			new KeyboardEvent('keydown', {
				key,
				ctrlKey,
				bubbles: true,
				cancelable: true,
			}),
		)
		target.dispatchEvent(
			new KeyboardEvent('keyup', { key, ctrlKey, bubbles: true }),
		)
	})
}

async function click(container: HTMLElement, label: string) {
	const button = Array.from(container.querySelectorAll('button')).find(
		(button) => button.textContent === label,
	)
	expect(button, `Button: ${label}`).toBeDefined()
	await act(async () => button!.click())
}

describe('app keyboard shortcuts', () => {
	beforeAll(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		HTMLDialogElement.prototype.showModal = function () {
			this.open = true
		}
		HTMLDialogElement.prototype.close = function () {
			this.open = false
			this.dispatchEvent(new Event('close'))
		}
	})
	beforeEach(() => localStorage.clear())

	it('loads a saved binding before registering the search command', async () => {
		localStorage.setItem(
			storageKey,
			JSON.stringify({ 'search.toggle': 'Mod+J' }),
		)
		using view = await renderShortcuts()
		await press('k', true)
		expect(view.container.querySelector('output')!.textContent).toBe('0')
		await press('j', true, view.container.querySelector('input')!)
		expect(view.container.querySelector('output')!.textContent).toBe('1')
	})

	it.each([
		'{broken',
		'null',
		'{"search.toggle":"Nonsense"}',
		'{"search.toggle":"Escape"}',
		'{"search.toggle":[]}',
	])('falls back safely for invalid saved preferences: %s', async (saved) => {
		localStorage.setItem(storageKey, saved)
		using view = await renderShortcuts()
		await press('k', true)
		expect(view.container.querySelector('output')!.textContent).toBe('1')
	})

	it('records and persists a new binding, then restores the default', async () => {
		using view = await renderShortcuts()
		await click(view.container, 'Keyboard shortcuts')
		expect(view.container.querySelector('dialog')!.open).toBe(true)
		await click(view.container, 'Change search shortcut')
		await press('j', true)
		expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
			'search.toggle': 'Mod+J',
		})
		await click(view.container, 'Close')
		await press('j', true)
		expect(view.container.querySelector('output')!.textContent).toBe('1')
		await click(view.container, 'Keyboard shortcuts')
		await click(view.container, 'Reset search shortcut')
		expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({})
	})

	it('rejects a conflicting shortcut without replacing the saved binding', async () => {
		using view = await renderShortcuts()
		await click(view.container, 'Keyboard shortcuts')
		await click(view.container, 'Change search shortcut')
		await press('l', true)
		expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
			/conflict|in use/i,
		)
		expect(localStorage.getItem(storageKey)).toBeNull()
		expect(view.container.querySelector('dialog')!.open).toBe(true)
		await press('k', true)
		expect(view.container.querySelector('[role="alert"]')).toBeNull()
	})

	it('suspends background commands and restores them after dismissal', async () => {
		using view = await renderShortcuts()
		await click(view.container, 'Keyboard shortcuts')
		expect(view.container.querySelector('dialog')!.textContent).toContain(
			'Paused while another overlay is open',
		)
		await press('k', true)
		expect(view.container.querySelector('output')!.textContent).toBe('0')
		await press('Escape')
		expect(view.container.querySelector('dialog')).toBeNull()
		await press('k', true)
		expect(view.container.querySelector('output')!.textContent).toBe('1')
	})

	it('does not hijack typing when search is rebound to a plain letter', async () => {
		localStorage.setItem(storageKey, JSON.stringify({ 'search.toggle': 'J' }))
		using view = await renderShortcuts()
		await press('j', false, view.container.querySelector('input')!)
		expect(view.container.querySelector('output')!.textContent).toBe('0')
		await press('j')
		expect(view.container.querySelector('output')!.textContent).toBe('1')
	})
})
