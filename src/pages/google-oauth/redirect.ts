import type { APIRoute } from 'astro'

import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET,
  new URL('/google-auth/callback', import.meta.env.DEV ? 'http://localhost:4321' : import.meta.env.SITE).href
)
console.log(import.meta.env.GOOGLE_OAUTH_CLIENT_ID)
// Access scopes for read-only Drive activity.
const scopes = ['https://www.googleapis.com/auth/drive']


export const GET: APIRoute = (c) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  })
  return c.redirect(authorizationUrl)
}
