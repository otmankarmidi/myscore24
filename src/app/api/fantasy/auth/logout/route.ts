import { NextResponse } from 'next/server'
import { FANTASY_COOKIE_NAME } from '@/lib/fantasy/auth'

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully.' })
  res.cookies.delete(FANTASY_COOKIE_NAME)
  return res
}
