import {createCookie} from 'react-router'

export const themeCookie = createCookie('theme', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
})

export async function getThemeFromCookie(req: Request) {
  const theme = await themeCookie.parse(req.headers.get('Cookie'))
  return theme || 'light'
}
