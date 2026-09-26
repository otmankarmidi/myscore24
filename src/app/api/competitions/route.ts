import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockLeagues } from '@/data/mockLeagues'
import { getCountryCode, getCountryFlagUrl } from '@/lib/countries'
import { getCompetitionPriority } from '@/config/competitions'
import { League } from '@/types/league'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

let memoryCache: { data: League[]; timestamp: number } | null = null
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET() {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL) {
    const res = NextResponse.json(memoryCache.data)
    res.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600')
    return res
  }

  try {
    // 1. Fetch all competitions stored in MySQL
    const dbCompetitions = await prisma.competition.findMany({
      include: {
        country: true,
      },
    })

    const dbMap = new Map<number, any>()
    ;(dbCompetitions as any[]).forEach((c: any) => {
      dbMap.set(c.providerId, c)
    })

    // 2. Start with canonical top leagues
    const results: League[] = mockLeagues.map((ml) => {
      const pId = Number(ml.id)
      const dbMatch = dbMap.get(pId)

      const countryName = dbMatch?.country?.name || ml.country
      const countryCode = getCountryCode(countryName, dbMatch?.country?.code || ml.countryCode)
      const countryFlag = getCountryFlagUrl(countryName, dbMatch?.country?.flag || ml.countryFlag)

      return {
        ...ml,
        logo: dbMatch?.logo || ml.logo,
        country: countryName,
        countryCode,
        countryFlag: countryFlag || ml.countryFlag,
      }
    })

    // 3. Add any other stored MySQL competitions that aren't in mockLeagues
    const existingIds = new Set(results.map((r) => Number(r.id)))
    for (const c of dbCompetitions) {
      if (!existingIds.has(c.providerId)) {
        const countryName = c.country?.name || 'Global'
        const countryCode = getCountryCode(countryName, c.country?.code)
        const countryFlag = getCountryFlagUrl(countryName, c.country?.flag)

        results.push({
          id: String(c.providerId),
          slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `league-${c.providerId}`,
          name: c.name,
          shortName: c.name,
          logo: c.logo || `https://media.api-sports.io/football/leagues/${c.providerId}.png`,
          country: countryName,
          countryCode,
          countryFlag: countryFlag || undefined,
          season: '2024/25',
          type: 'league',
        })
      }
    }

    // 4. Sort by competition priority (Big 5 first, Europe, International, others)
    results.sort((a, b) => getCompetitionPriority(a) - getCompetitionPriority(b))

    memoryCache = { data: results, timestamp: Date.now() }

    const res = NextResponse.json(results)
    res.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600')
    return res
  } catch (err) {
    console.warn('[API /api/competitions] Database query failed, using static top leagues:', err)
    return NextResponse.json(mockLeagues)
  }
}
