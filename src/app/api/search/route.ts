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
          slug: p.slug || String(p.providerPlayerId),
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

    // Merge mock/curated players so popular icons (Messi, Ronaldo, Yamal) are always discoverable
    for (const mp of mockPlayers) {
      if (matchingPlayers.length >= 6) break
      const matchesQuery =
        mp.name.toLowerCase().includes(q) ||
        mp.firstName?.toLowerCase().includes(q) ||
        mp.lastName?.toLowerCase().includes(q) ||
        mp.slug.toLowerCase().includes(q) ||
        (mp.team?.name || '').toLowerCase().includes(q)

      const alreadyExists = matchingPlayers.some(
        (existing) => existing.id === mp.id || existing.slug === mp.slug
      )

      if (matchesQuery && !alreadyExists) {
        matchingPlayers.push({
          id: mp.id,
          slug: mp.slug,
          name: mp.name,
          position: mp.position,
          number: mp.number,
          teamName: mp.team?.name || 'Club',
          teamLogo: mp.team?.logo,
          photo: mp.photo,
        })
      }
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
