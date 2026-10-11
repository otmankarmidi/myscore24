import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockPlayers } from '@/data/mockPlayers'
import { mockTeams } from '@/data/mockTeams'
import { mockLeagues } from '@/data/mockLeagues'
import { cacheEngine, CACHE_TTLS } from '@/services/sports/cacheEngine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    if (!q || q.length < 2) {
      return NextResponse.json({ players: [], teams: [], leagues: [] })
    }

    const cacheKey = `search:${q}`
    const cached = cacheEngine.get<any>('search', cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // 1. Search Players in MySQL
    let matchingPlayers: any[] = []
    try {
      const dbPlayers = await prisma.player.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { firstname: { contains: q } },
            { lastname: { contains: q } },
          ],
        },
        include: {
          currentClub: true,
        },
        take: 6,
      })

      if (dbPlayers.length > 0) {
        matchingPlayers = dbPlayers.map((p: any) => ({
          id: String(p.providerPlayerId),
          slug: String(p.providerPlayerId),
          name: p.name,
          position: p.currentPosition || 'Player',
          number: p.currentSquadNumber || undefined,
          teamName: p.currentClub?.name || 'Club',
          teamLogo: p.currentClub?.logo || undefined,
          photo: p.photo || undefined,
        }))
      }
    } catch (dbErr) {
      console.warn('[Search] DB player search error:', dbErr)
    }

    // Fallback to mock players if database returned no results
    if (matchingPlayers.length === 0) {
      matchingPlayers = mockPlayers
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.firstName?.toLowerCase().includes(q) ||
            p.lastName?.toLowerCase().includes(q) ||
            p.team?.name.toLowerCase().includes(q)
        )
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          position: p.position,
          number: p.number,
          teamName: p.team?.name || 'Club',
          teamLogo: p.team?.logo,
          photo: p.photo,
        }))
    }

    // 2. Search Teams in MySQL
    let matchingTeams: any[] = []
    try {
      const dbTeams = await prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
          ],
        },
        take: 5,
      })

      if (dbTeams.length > 0) {
        matchingTeams = dbTeams.map((t: any) => ({
          id: String(t.providerId),
          slug: String(t.providerId),
          name: t.name,
          abbreviation: t.code || t.name.slice(0, 3).toUpperCase(),
          logo: t.logo || undefined,
          country: t.country || '',
        }))
      }
    } catch (dbErr) {
      console.warn('[Search] DB team search error:', dbErr)
    }

    if (matchingTeams.length === 0) {
      matchingTeams = mockTeams
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.shortName?.toLowerCase().includes(q) ||
            t.abbreviation?.toLowerCase().includes(q)
        )
        .slice(0, 5)
    }

    // 3. Search Leagues in MySQL
    let matchingLeagues: any[] = []
    try {
      const dbComps = await prisma.competition.findMany({
        where: {
          name: { contains: q },
        },
        include: {
          country: true,
        },
        take: 4,
      })

      if (dbComps.length > 0) {
        matchingLeagues = dbComps.map((c: any) => ({
          id: String(c.providerId),
          slug: String(c.providerId),
          name: c.name,
          logo: c.logo || undefined,
          country: c.country?.name || '',
          countryFlag: c.country?.flag || undefined,
        }))
      }
    } catch (dbErr) {
      console.warn('[Search] DB league search error:', dbErr)
    }

    if (matchingLeagues.length === 0) {
      matchingLeagues = mockLeagues
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.shortName?.toLowerCase().includes(q)
        )
        .slice(0, 4)
    }

    const result = {
      players: matchingPlayers,
      teams: matchingTeams,
      leagues: matchingLeagues,
    }

    cacheEngine.set('search', cacheKey, result, CACHE_TTLS.ENTITY_INFO)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Search failed', players: [], teams: [], leagues: [] },
      { status: 500 }
    )
  }
}
