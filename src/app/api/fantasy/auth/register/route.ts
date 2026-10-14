import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createFantasySessionToken, getFantasyCookieConfig } from '@/lib/fantasy/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, managerName, teamName, favoriteClubId } = body

    if (!email || !password || !managerName || !teamName) {
      return NextResponse.json(
        { error: 'All fields (email, password, manager name, team name) are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanTeamName = teamName.trim()
    const cleanManagerName = managerName.trim()

    // Check if email exists
    const existingEmail = await prisma.fantasyUser.findUnique({
      where: { email: cleanEmail },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Check if team name exists
    const existingTeam = await prisma.fantasyUser.findUnique({
      where: { teamName: cleanTeamName },
    })
    if (existingTeam) {
      return NextResponse.json(
        { error: 'This fantasy team name is already taken. Please choose another one.' },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)

    const user = await prisma.fantasyUser.create({
      data: {
        email: cleanEmail,
        passwordHash,
        managerName: cleanManagerName,
        teamName: cleanTeamName,
        favoriteClubId: favoriteClubId || null,
      },
    })

    // Auto-enroll user into Global League
    const globalLeague = await prisma.fantasyLeague.findFirst({
      where: { code: 'GLOBAL' },
    })

    const token = createFantasySessionToken(user.id)
    const cookieConfig = getFantasyCookieConfig()

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        managerName: user.managerName,
        teamName: user.teamName,
        hasSquad: false,
      },
    })

    res.cookies.set(cookieConfig.name, token, cookieConfig)
    return res
  } catch (err: any) {
    console.error('Fantasy registration error:', err)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
