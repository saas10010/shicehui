import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/constants'

function isAuthed(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value === '1'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authed = isAuthed(request)

  if (pathname === '/login' && authed) {
    const url = request.nextUrl.clone()
    url.pathname = '/classes'
    return NextResponse.redirect(url)
  }

  if (!authed) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/classes/:path*',
    '/homework/:path*',
    '/data/:path*',
    '/materials/:path*',
    '/tasks/:path*',
    '/reinforce/:path*',
    '/settings/:path*',
    '/students/:path*',
  ],
}
