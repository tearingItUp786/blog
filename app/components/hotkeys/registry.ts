import { defineAppHotkeys } from '@tanstack/react-hotkeys'

export const appHotkeys = defineAppHotkeys({
	'search.toggle': {
		hotkey: 'Mod+K',
		meta: { name: 'Open / close search', group: 'Search' },
	},
	'search.close': {
		hotkey: 'Escape',
		scope: 'search',
		meta: { name: 'Close search', group: 'Overlays' },
	},
	'menu.close': {
		hotkey: 'Escape',
		scope: 'mobile-menu',
		meta: { name: 'Close mobile menu', group: 'Overlays' },
	},
	'toc.close': {
		hotkey: 'Escape',
		scope: 'article-toc',
		meta: { name: 'Close table of contents', group: 'Overlays' },
	},
	'shortcuts.close': {
		hotkey: 'Escape',
		scope: 'shortcuts',
		meta: { name: 'Close keyboard shortcuts', group: 'Overlays' },
	},
})

declare module '@tanstack/react-hotkeys' {
	interface Register {
		appHotkeys: typeof appHotkeys
	}
}
