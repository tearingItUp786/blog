import { resolveModifier } from '@tanstack/react-hotkeys'
import { useEffect, useState } from 'react'

/** A primary-modifier tap reveals help; a chord must never reveal it. */
export function useSearchShortcutHint(enabled: boolean, shortcut: string) {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined
		let isCandidate = false
		const pressedKeys = new Set<string>()
		const modifier = resolveModifier('Mod')
		function dismiss() {
			clearTimeout(timeout)
			isCandidate = false
			setIsVisible(false)
		}
		function reset() {
			dismiss()
			pressedKeys.clear()
		}
		function keydown(event: KeyboardEvent) {
			if (event.repeat) return
			const wasAlone = pressedKeys.size === 0
			dismiss()
			pressedKeys.add(event.key)
			isCandidate =
				event.key === modifier &&
				wasAlone &&
				!event.altKey &&
				!event.shiftKey &&
				!(modifier === 'Meta' ? event.ctrlKey : event.metaKey)
		}
		function keyup(event: KeyboardEvent) {
			pressedKeys.delete(event.key)
			if (event.key !== modifier) return
			if (isCandidate && document.visibilityState !== 'hidden') {
				setIsVisible(true)
				timeout = setTimeout(() => setIsVisible(false), 3000)
			}
			isCandidate = false
			// macOS can omit other keyup events while Command is held.
			pressedKeys.clear()
		}
		reset()
		if (!enabled) return
		document.addEventListener('keydown', keydown, true)
		document.addEventListener('keyup', keyup, true)
		document.addEventListener('pointerdown', reset, true)
		document.addEventListener('visibilitychange', reset)
		window.addEventListener('blur', reset)
		return () => {
			clearTimeout(timeout)
			document.removeEventListener('keydown', keydown, true)
			document.removeEventListener('keyup', keyup, true)
			document.removeEventListener('pointerdown', reset, true)
			document.removeEventListener('visibilitychange', reset)
			window.removeEventListener('blur', reset)
		}
	}, [enabled, shortcut])

	return enabled && isVisible
}
