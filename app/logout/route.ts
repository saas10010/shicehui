import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/constants'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  return response
}
