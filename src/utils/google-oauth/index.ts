import { google } from "googleapis"
import { number, object, parse, string, type Output, type BaseSchema, any, type Input, safeParse } from "valibot"

export const redirectUri = new URL('/google-oauth/callback', import.meta.env.DEV ? (import.meta.env.DEV_SITE ?? 'http://localhost:4321') : import.meta.env.SITE).href

export const makeOauth2Client = () => new google.auth.OAuth2({
  clientId: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri
})

export const accessTokenResponseSchema = object({
  access_token: string(),
  expires_in: number(),
  scope: string(),
  token_type: string(),
  id_token: string()
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
  console.log(result)
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
  data.append('redirect_uri', redirectUri)

  const req = new Request(targetUrl, {
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  })
  const json = await fetch(req).then(res => res.json())
  console.log(json)
  return parse(accessTokenResponseSchema, json)
}

type FetchResult <Schema extends BaseSchema> = {
  response: Response
} & ({
  success: true
  data: Schema
} | {
  success: false
})
const makeFetchAPIFunc = <Schema extends BaseSchema>(scope: string, schema: Schema) => async (accessToken: string): Promise<FetchResult<Schema>> => {
  const token = `Bearer ${accessToken}`
  const req = new Request(scope, {
    headers: {
      "x-goog-api-client": "gdcl/7.0.1 gl-node/20.11.0",
      "Accept-Encoding": "gzip",
      "User-Agent": "google-api-nodejs-client/7.0.1 (gzip)",
      "Authorization": token
    }
  })
  const res = await fetch(req)
  const result = await res.json()
  console.log(result)
  const parsed = safeParse(schema, result)
  if (parsed.success) {
    return {
      success: true,
      data: result,
      response: res
    }
  }
  return {
    success: false,
    response: res
  }
}
export const fetchUserInfo = makeFetchAPIFunc('https://www.googleapis.com/oauth2/v2/userinfo', object({
  id: string(),
  name: string(),
  given_name: string(),
  family_name: string(),
  picture: string(),
  locale: string()
}))
