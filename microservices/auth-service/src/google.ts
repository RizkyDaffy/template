import { config } from './config.ts'

const VER = 'https://openid.net/specs/openid-connect-core-1_0.html'
const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN = 'https://oauth2.googleapis.com/token'
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo'

export function googleAuthUrl(state: string): string | null {
  if (!config.google.enabled) return null
  const u = new URL(AUTH)
  u.searchParams.set('client_id', config.google.clientId)
  u.searchParams.set('redirect_uri', `${baseUrl()}/auth/google/callback`)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('scope', 'openid email profile')
  u.searchParams.set('state', state)
  return u.toString()
}

export async function googleExchange(code: string): Promise<{ sub: string; email: string; name?: string } | null> {
  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: `${baseUrl()}/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return null
  const tokens = (await res.json()) as { access_token?: string }
  if (!tokens.access_token) return null
  const ui = await fetch(USERINFO, { headers: { authorization: `Bearer ${tokens.access_token}` } })
  if (!ui.ok) return null
  const profile = (await ui.json()) as { sub: string; email: string; name?: string }
  if (!profile.email_verified) return null
  return profile
}

export function googleDocsUrl(): string {
  return VER
}

function baseUrl(): string {
  return config.publicApiUrl || `http://localhost:${config.port}`
}
