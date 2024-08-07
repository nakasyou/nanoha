import type { APIRoute } from 'astro'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { safeParse } from 'valibot'
import {
  type Credentials,
  credentialsSchema,
  fetchUserInfo,
  refreshAccessToken,
} from '../../utils/google-oauth'

const app = new Hono<{
  Variables: {
    googleOauthCredentials: Credentials
  }
}>().basePath('/api')

const googleRoutes = app
  .basePath('/google')
  .use('*', async (c, next) => {
    const credentialsText = getCookie(c, 'GOOGLE_OAUTH2_CREDENTIALS')
    if (!credentialsText) {
      return c.json(
        {
          error: 'NOT_LOGINED',
        },
        400,
      )
    }
    const credentials = safeParse(
      credentialsSchema,
      JSON.parse(credentialsText),
    )

    if (!credentials.success) {
      return c.json(
        {
          error: 'NOT_LOGINED',
        },
        400,
      )
    }
    const newCredentials = await refreshAccessToken(
      credentials.output.refresh_token || '',
    )

    c.set('googleOauthCredentials', newCredentials)
    await next()
  })
  .get('/get-user-info', async (c) => {
    const userInfo = await fetchUserInfo(
      c.var.googleOauthCredentials.access_token,
    )

    if (!userInfo.success) {
      return c.json({
        success: false,
      })
    }

    return c.json({
      data: userInfo.data,
    })
  })
  .get('/get-avater', async (c) => {
    const userInfo = await fetchUserInfo(
      c.var.googleOauthCredentials.access_token,
    )
    if (!userInfo.success) {
      return c.json({
        success: false,
      })
    }
    c.header('Content-Type', 'image')
    return c.body(
      await fetch(userInfo.data.picture).then((res) => res.arrayBuffer()),
    )
  })

export type Routes = typeof app | typeof googleRoutes

export const ALL: APIRoute = async (c) => {
  return await app.fetch(c.request)
}
