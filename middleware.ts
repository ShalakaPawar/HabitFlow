import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthConfig, getExpectedSessionToken } from '@/lib/auth'

const PUBLIC_PATH_PREFIXES = [
  '/_next',
  '/api/auth/login',
  '/api/auth/logout',
  '/manifest.json',
  '/icon.svg',
]

const PUBLIC_EXACT_PATHS = ['/login']

function isPublicPath(pathname: string) {
  return PUBLIC_EXACT_PATHS.includes(pathname) || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(req: NextRequest) {
  const { enabled, cookieName } = getAuthConfig()

  if (!enabled) {
    return NextResponse.next()
  }

  const { pathname, search } = req.nextUrl
  const cookie = req.cookies.get(cookieName)?.value
  const expectedToken = await getExpectedSessionToken()
  const isAuthenticated = Boolean(cookie && expectedToken && cookie === expectedToken)

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/api/:path*'],
}
