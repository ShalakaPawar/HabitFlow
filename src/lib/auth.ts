const SESSION_COOKIE_NAME = 'habitflow_session'

function encodeHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function getAuthConfig() {
  return {
    password: process.env.APP_PASSWORD ?? '',
    sessionSecret: process.env.APP_SESSION_SECRET ?? '',
    cookieName: process.env.APP_SESSION_COOKIE_NAME ?? SESSION_COOKIE_NAME,
    enabled: Boolean(process.env.APP_PASSWORD && process.env.APP_SESSION_SECRET),
  }
}

export async function createSessionToken(password: string, sessionSecret: string) {
  const data = new TextEncoder().encode(`${password}:${sessionSecret}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return encodeHex(new Uint8Array(digest))
}

export async function getExpectedSessionToken() {
  const { password, sessionSecret, enabled } = getAuthConfig()
  if (!enabled) return null
  return createSessionToken(password, sessionSecret)
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
