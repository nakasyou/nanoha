import type { APIRoute } from 'astro'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { parse, safeParse } from 'valibot'
import { makeOauth2Client, type Credentials, accessTokenResponseSchema, fetchUserInfo } from '../../utils/google-oauth'

const app = new Hono<{
  Variables: {
    googleOauthCredentials: Credentials
  }
}>().basePath('/api')

const googleRoutes = app.basePath('/google')
  .use('*', async (c, next) => {
    const credentialsText = getCookie(c, 'GOOGLE_OAUTH2_CREDENTIALS')
    if (!credentialsText) {
      return c.json({
        error: 'NOT_LOGINED'
      }, 400)
    }
    const credentials = safeParse(accessTokenResponseSchema, JSON.parse(credentialsText))
    if (!credentials.success) {
      return c.json({
        error: 'NOT_LOGINED'
      }, 400)
    }

    c.set('googleOauthCredentials', credentials.output)
    await next()
  })
  .get('/get-user-info', async c => {
    return c.json(await fetchUserInfo(c.var.googleOauthCredentials.access_token))
  })
  .get('/get-nnote', async c => {
    const driveClient = google.drive({ version: 'v2', auth: c.var.googleOauthClient })

    const list = await driveClient.files.list()

    return c.json(list)
  })

export type Routes = typeof app | typeof googleRoutes

export const ALL: APIRoute = async c => {
  return await app.fetch(c.request)
}
