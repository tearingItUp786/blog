import { createCookie } from 'react-router'
import { ThemeSchema } from './theme'

export const ThemeCookieSchema = ThemeSchema.catch('light')

export const themeCookie = createCookie('theme', {
	httpOnly: true,
	path: '/',
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 * 30, // 30 days
})

export async function getThemeFromCookie(req: Request) {
	const cookieValue = await themeCookie.parse(req.headers.get('Cookie'))
	const theme = ThemeCookieSchema.parse(cookieValue)
	return theme
}
