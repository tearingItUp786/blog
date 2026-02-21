import { describe, expect, it } from 'vitest'
import { getThemeFromCookie, themeCookie } from '~/utils/theme.server'

describe('theme cookie smoke tests', () => {
	it('parses a valid theme from cookie', async () => {
		const cookie = await themeCookie.serialize('dark')
		const request = new Request('http://localhost', {
			headers: { Cookie: cookie },
		})

		await expect(getThemeFromCookie(request)).resolves.toBe('dark')
	})

	it('falls back to light for invalid cookie values', async () => {
		const request = new Request('http://localhost', {
			headers: { Cookie: 'theme=not-a-theme' },
		})

		await expect(getThemeFromCookie(request)).resolves.toBe('light')
	})
})
