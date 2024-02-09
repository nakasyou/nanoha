import type { APIRoute } from 'astro'
import { google } from 'googleapis'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { accessTokenResponseSchema } from '../google-oauth/callback'
import { parse, safeParse } from 'valibot'
import { makeOauth2Client } from '../../utils/google-oauth/oauth2client'
import type { OAuth2Client } from 'google-auth-library'

const app = new Hono<{
  Variables: {
    googleOauthClient: OAuth2Client
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
    const client = makeOauth2Client()
    const credentials = safeParse(accessTokenResponseSchema, JSON.parse(credentialsText))
    if (!credentials.success) {
      return c.json({
        error: 'NOT_LOGINED'
      }, 400)
    }

    client.setCredentials(credentials.output)
    c.set('googleOauthClient', client)
    await next()
  })
  .get('/get-user-info', async c => {
    const oauth2client = google.oauth2({ version: 'v2', auth: c.var.googleOauthClient })
    const userInfo = await oauth2client.userinfo.get()
    return c.json(userInfo.data)
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
