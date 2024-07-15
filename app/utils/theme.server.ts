import {createCookie} from '@remix-run/node'

let secret = process.env.COOKIE_SECRET || 'default'
if (secret === 'default') {
  console.warn('Please set COOKIE_SECRET in your .env file')
  secret = 'default-secret'
}

export const themeCookie = createCookie('theme', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secrets: [secret],
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
})

export async function getThemeFromCookie(req: Request) {
  let theme = await themeCookie.parse(req.headers.get('Cookie'))
  return theme || 'system'
}
