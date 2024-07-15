import {
  number,
  object,
  parse,
  string,
  type InferOutput,
  type BaseSchema,
  any,
  safeParse,
  optional,
} from 'valibot'

export const redirectUri = new URL(
  '/google-oauth/callback',
  import.meta.env.DEV
    ? import.meta.env.DEV_SITE ?? 'http://localhost:4321'
    : import.meta.env.SITE,
).href

export const credentialsSchema = object({
  access_token: string(),
  expires_in: number(),
  refresh_token: optional(string()),
  scope: string(),
  token_type: string(),
  id_token: string(),
})

export type Credentials = InferOutput<typeof credentialsSchema>

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
  data.append('redirect_uri', redirectUri)

  const req = new Request(targetUrl, {
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })
  const json = await fetch(req).then((res) => res.json())

  return parse(credentialsSchema, json)
}
export const refreshAccessToken = async (refreshToken: string) => {
  const data = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'refresh_token',
    access_type: 'offline',
  })
  const res = await fetch('https://www.googleapis.com/oauth2/v4/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
    method: 'POST',
  })
  return parse(credentialsSchema, await res.json())
}

// biome-ignore lint/suspicious/noExplicitAny: BaseSchema
type FetchResult<Schema extends BaseSchema<any, any, any>> = {
  response: Response
} & (
  | {
      success: true
      data: InferOutput<Schema>
    }
  | {
      success: false
    }
)
const makeFetchAPIFunc = // biome-ignore lint/suspicious/noExplicitAny: BaseSchema
    <Schema extends BaseSchema<any, any, any>>(scope: string, schema: Schema) =>
    async (accessToken: string): Promise<FetchResult<Schema>> => {
      const token = `Bearer ${accessToken}`
      const req = new Request(scope, {
        headers: {
          'x-goog-api-client': 'gdcl/7.0.1 gl-node/20.11.0',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'google-api-nodejs-client/7.0.1 (gzip)',
          Authorization: token,
        },
      })
      const res = await fetch(req)
      const result = await res.json()
      const parsed = safeParse(schema, result)
      if (parsed.success) {
        return {
          success: true,
          data: result,
          response: res,
        }
      }
      return {
        success: false,
        response: res,
      }
    }
export const fetchUserInfo = makeFetchAPIFunc(
  'https://www.googleapis.com/oauth2/v2/userinfo',
  object({
    id: string(),
    name: string(),
    given_name: string(),
    family_name: string(),
    picture: string(),
    locale: string(),
  }),
)
