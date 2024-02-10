import type { APIRoute } from 'astro'
import { makeOauth2Client } from '../../utils/google-oauth/oauth2client'

// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.profile'
]


export const GET: APIRoute = (c) => {
  const authorizationUrl = makeOauth2Client().generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  })
  return c.redirect(authorizationUrl)
}
