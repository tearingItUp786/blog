// @vitest-environment jsdom

import { useHotkey } from '@tanstack/react-hotkeys'
import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import { AppHotkeysProvider } from '~/components/hotkeys/provider'
import { MobileTableOfContents } from '~/routes/blog.$slug/table-of-contents'

function BackgroundCommand() {
	const [count, setCount] = useState(0)
	useHotkey('Mod+K', () => setCount((value) => value + 1))
	return createElement('output', null, count)
}

it('gives the open table of contents exclusive keys and returns focus on Escape', async () => {
	Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	try {
		await act(async () =>
			root.render(
				createElement(
					AppHotkeysProvider,
					null,
					createElement(BackgroundCommand),
					createElement(MobileTableOfContents, {
						headings: [
							{ id: 'one', text: 'One', depth: 2 },
							{ id: 'two', text: 'Two', depth: 2 },
						],
					}),
				),
			),
		)
		const details = container.querySelector('details')!
		await act(async () => {
			details.open = true
			details.dispatchEvent(new Event('toggle'))
		})
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'k',
					ctrlKey: true,
					bubbles: true,
				}),
			)
		})
		expect(container.querySelector('output')!.textContent).toBe('0')
		container.querySelector('a')!.focus()
		await act(async () => {
			document.activeElement!.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
			)
		})
		expect(details.open).toBe(false)
		expect(document.activeElement).toBe(container.querySelector('summary'))
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'k',
					ctrlKey: true,
					bubbles: true,
				}),
			)
		})
		expect(container.querySelector('output')!.textContent).toBe('1')
	} finally {
		await act(async () => root.unmount())
		container.remove()
	}
})
