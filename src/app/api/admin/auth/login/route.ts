import { NextRequest, NextResponse } from 'next/server'
import { getAdminCredentials, createAdminSessionToken, getAdminCookieConfig } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    const expected = getAdminCredentials()

    if (!username || !password || username !== expected.username || password !== expected.password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken(expected.username)
    const cookieConfig = getAdminCookieConfig()

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { username: expected.username },
    })

    res.cookies.set(cookieConfig.name, token, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
    })

    return res
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
