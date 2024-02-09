import { google } from "googleapis"

export const redirectUri = new URL('/google-oauth/callback', import.meta.env.DEV ? 'http://localhost:4321' : import.meta.env.SITE).href
export const makeOauth2Client = () => new google.auth.OAuth2({
  clientId: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.GOOGLE_OAUTH_CLIENT_ID,
  redirectUri
})
