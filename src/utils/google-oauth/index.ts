import { google } from "googleapis"
import { number, object, parse, string, type Output, type BaseSchema, any } from "valibot"

export const redirectUri = new URL('/google-oauth/callback', import.meta.env.DEV ? 'http://localhost:4321' : import.meta.env.SITE).href
export const makeOauth2Client = () => new google.auth.OAuth2({
  clientId: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  redirectUri
})

export const accessTokenResponseSchema = object({
  access_token: string(),
  expires_in: number(),
  refresh_token: string(),
  scope: string(),
  token_type: string()
})

export type Credentials = Output<typeof accessTokenResponseSchema>

export const createAuthRedirectURL = (scopes: string[]) => {
  const params = new URLSearchParams()

  params.append('access_type', 'offline')
  params.append('scope', scopes.join(' '))
  params.append('include_granted_scopes', 'true')
  params.append('response_type', 'code')
  params.append('client_id', import.meta.env.GOOGLE_OAUTH_CLIENT_ID)
  params.append('redirect_uri', redirectUri)

  const result = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  return result
}

export const fetchAccessToken = async (callbackCode: string) => {
  const targetUrl = 'https://oauth2.googleapis.com/token'

  const data = new URLSearchParams()
  data.append('code', callbackCode)
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

  return parse(accessTokenResponseSchema, json)
}

const makeFetchAPIFunc = <Schema extends BaseSchema>(scope: string, schema: Schema) => async (accessToken: string) => {
  const result = await fetch(scope, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then(res => res.json())
  
  return parse(schema, result)
}
export const fetchUserInfo = makeFetchAPIFunc('https://www.googleapis.com/oauth2/v1/userinfo', object({
  id: string(),
  name: string(),
  given_name: string(),
  family_name: string()
}))
