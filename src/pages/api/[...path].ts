import type { APIRoute } from 'astro'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { safeParse } from 'valibot'
import { type Credentials, credentialsSchema, fetchUserInfo } from '../../utils/google-oauth'

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
    const credentials = safeParse(credentialsSchema, JSON.parse(credentialsText))
    if (!credentials.success) {
      return c.json({
        error: 'NOT_LOGINED'
      }, 400)
    }

    c.set('googleOauthCredentials', credentials.output)
    await next()
  })
  .get('/get-user-info', async c => {
    const userInfo = await fetchUserInfo(c.var.googleOauthCredentials.access_token)

    return c.json({success: userInfo.success, ...(userInfo.success ? {
      data: userInfo.data
    } : {})})
  })

export type Routes = typeof app | typeof googleRoutes

export const ALL: APIRoute = async c => {
  return await app.fetch(c.request)
}
