import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, getAuthConfig, getSessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, enabled, sessionSecret, cookieName } = getAuthConfig()

    if (!enabled) {
      return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 500 })
    }

    if (!body?.password || body.password !== password) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    const token = await createSessionToken(password, sessionSecret)

    response.cookies.set(cookieName, token, getSessionCookieOptions())

    return response
  } catch {
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 })
  }
}
