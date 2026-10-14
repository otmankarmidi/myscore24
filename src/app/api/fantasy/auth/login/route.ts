import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createFantasySessionToken, getFantasyCookieConfig } from '@/lib/fantasy/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { login, password } = body

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Email/Team name and password are required.' },
        { status: 400 }
      )
    }

    const cleanLogin = login.trim()

    // Find by email or teamName
    const user = await prisma.fantasyUser.findFirst({
      where: {
        OR: [
          { email: cleanLogin.toLowerCase() },
          { teamName: cleanLogin },
        ],
      },
      include: {
        squad: {
          select: { id: true, totalPoints: true, bank: true, squadValue: true },
        },
      },
    })

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = createFantasySessionToken(user.id)
    const cookieConfig = getFantasyCookieConfig()

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        managerName: user.managerName,
        teamName: user.teamName,
        role: user.role,
        hasSquad: !!user.squad,
        squad: user.squad,
      },
    })

    res.cookies.set(cookieConfig.name, token, cookieConfig)
    return res
  } catch (err: any) {
    console.error('Fantasy login error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    )
  }
}
