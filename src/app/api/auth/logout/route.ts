import { NextResponse } from 'next/server'
import { getAuthConfig } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  const { cookieName } = getAuthConfig()

  response.cookies.set(cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
