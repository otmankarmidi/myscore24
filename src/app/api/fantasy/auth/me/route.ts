import { NextResponse } from 'next/server'
import { getFantasySessionUser } from '@/lib/fantasy/auth'

export async function GET() {
  const user = await getFantasySessionUser()
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      managerName: user.managerName,
      teamName: user.teamName,
      role: user.role,
      avatar: user.avatar,
      hasSquad: !!user.squad,
      squad: user.squad,
    },
  })
}
