import type { APIRoute } from 'astro'
import { number, object, safeParse, string } from 'valibot'
import { fetchAccessToken, redirectUri } from '../../utils/google-oauth'

export const GET: APIRoute = async (c) => {
  const code = c.url.searchParams.get('code')
  if (!code) {
    return new Response('`code` is required.')
  }

  const result = await fetchAccessToken(code)

  c.cookies.set('GOOGLE_OAUTH2_CREDENTIALS', result, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 120,
    path: '/',
  })

  return c.redirect('/app')
}
