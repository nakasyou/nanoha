import type { APIRoute } from "astro"
import { makeOauth2Client, redirectUri } from "../../utils/google-oauth/oauth2client"
import { number, object, safeParse, string } from "valibot"

export const accessTokenResponseSchema = object({
  access_token: string(),
  expires_in: number(),
  refresh_token: string(),
  scope: string(),
  token_type: string()
})
export const GET: APIRoute = async (c) => {
  const code = c.url.searchParams.get('code')
  if (!code) {
    return new Response('`code` is required.')
  }

  const targetUrl = 'https://oauth2.googleapis.com/token'
  console.log(makeOauth2Client()._clientId)
  const data = new URLSearchParams()
  data.append('code', code)
  data.append('client_id', import.meta.env.GOOGLE_OAUTH_CLIENT_ID)
  data.append('client_secret', import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET)
  data.append('redirect_uri', redirectUri)
  data.append('grant_type', 'authorization_code')

  const req = new Request(targetUrl, {
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  })
  const json = await fetch(req).then(res => res.json())
  
  const parsed = safeParse(accessTokenResponseSchema, json)

  if (!parsed.success) {
    return new Response(JSON.stringify({
      error: 'Failed to get acsess token',
      issues: parsed.issues
    }))
  }
  const result = parsed.output

  c.cookies.set('GOOGLE_OAUTH2_CREDENTIALS', result, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 120,
    path: '/'
  })

  return new Response('a')
}
