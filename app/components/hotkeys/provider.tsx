import {
	HotkeysProvider,
	validateHotkey,
	type CustomHotkeys,
	type Hotkey,
} from '@tanstack/react-hotkeys'
import { useState, type ReactNode } from 'react'
import { z } from 'zod'
import { appHotkeys } from './registry'

const storageKey = 'blog:hotkeys:v1'
const savedHotkeysSchema = z.object({
	'search.toggle': z.union([z.string(), z.array(z.string()).min(1)]).optional(),
})

function readSavedHotkeys(): CustomHotkeys {
	try {
		const parsed = savedHotkeysSchema.safeParse(
			JSON.parse(localStorage.getItem(storageKey) ?? '{}'),
		)
		if (!parsed.success) return {}
		const binding = parsed.data['search.toggle']
		if (!binding) return {}
		const validation = validateHotkey(binding)
		if (!validation.valid || validation.warnings.length) return {}
		// Escape remains reserved, including inside a sequence.
		const steps = typeof binding === 'string' ? [binding] : binding
		if (
			steps.some((step) => step.split('+').at(-1)?.toLowerCase() === 'escape')
		)
			return {}
		return { 'search.toggle': binding as Hotkey }
	} catch {
		// SSR, private browsing and malformed preferences all use the defaults.
		return {}
	}
}

function saveHotkeys(customHotkeys: CustomHotkeys) {
	try {
		localStorage.setItem(storageKey, JSON.stringify(customHotkeys))
	} catch {
		// A binding still works for this session when storage is unavailable.
	}
}

export function AppHotkeysProvider({ children }: { children: ReactNode }) {
	// TanStack reads customHotkeys only when constructing its store.
	const [customHotkeys] = useState(readSavedHotkeys)
	return (
		<HotkeysProvider
			appHotkeys={appHotkeys}
			customHotkeys={customHotkeys}
			onCustomHotkeysChange={saveHotkeys}
		>
			{children}
		</HotkeysProvider>
	)
}
