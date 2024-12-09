import {createCookie} from '@remix-run/node'

export const themeCookie = createCookie('theme', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
})

export async function getThemeFromCookie(req: Request) {
  let theme = await themeCookie.parse(req.headers.get('Cookie'))
  console.log('👀 theme', theme)
  return theme || 'light'
}
