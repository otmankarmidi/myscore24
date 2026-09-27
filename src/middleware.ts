import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''

  // Match naked apex domain myscore24.com (with or without port)
  const isApexDomain = host === 'myscore24.com' || host.startsWith('myscore24.com:')

  if (isApexDomain) {
    const url = request.nextUrl.clone()
    url.host = 'www.myscore24.com'
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, 308) // Permanent redirect (preserves method, path, and query parameters)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for internal Next.js static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
