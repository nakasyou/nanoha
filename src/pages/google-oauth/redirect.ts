import type { APIRoute } from 'astro'
import { createAuthRedirectURL } from '../../utils/google-oauth'

// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.profile'
]

export const GET: APIRoute = (c) => {
  const authorizationUrl = createAuthRedirectURL(scopes)
  return c.redirect(authorizationUrl)
}
