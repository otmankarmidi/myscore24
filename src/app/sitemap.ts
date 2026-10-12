import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { buildMatchSlug } from '@/lib/football/matchUrl'
import { APPROVED_COMPETITIONS, APPROVED_COMPETITION_IDS } from '@/config/competitions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = 'https://www.myscore24.com'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Static Core Public Pages (Meaningful static lastModified to avoid false daily churn)
  const siteReleaseDate = new Date('2026-09-01T00:00:00Z')
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/live`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fixtures`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/results`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/competitions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ar/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: siteReleaseDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: siteReleaseDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: siteReleaseDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: siteReleaseDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: siteReleaseDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 2. Dynamic Database Entries (MySQL only — 0 external API calls)
  let newsRoutes: MetadataRoute.Sitemap = []
  let competitionRoutes: MetadataRoute.Sitemap = []
  let teamRoutes: MetadataRoute.Sitemap = []
  let matchRoutes: MetadataRoute.Sitemap = []

  try {
    const approvedProviderIds = Array.from(APPROVED_COMPETITION_IDS)

    const [dbArticles, competitions, teams, matches, completedMatches] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            lte: now,
          },
        },
        select: { slug: true, language: true, publishedAt: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 1000,
      }),
      prisma.competition.findMany({
        where: {
          providerId: { in: approvedProviderIds },
        },
        select: { providerId: true, name: true, updatedAt: true },
        take: 100,
      }),
      // Priority teams with real names and established venues
      prisma.team.findMany({
        where: {
          name: { not: '' },
          providerId: { gt: 0 },
        },
        select: { providerId: true, name: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 300,
      }),
      // Query upcoming matches from active approved leagues (next 14 days)
      prisma.match.findMany({
        where: {
          status: { in: ['NS', 'TBD', '1H', '2H', 'HT', 'LIVE'] },
          kickoff: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          },
          homeTeam: { name: { not: '' } },
          awayTeam: { name: { not: '' } },
        },
        select: {
          providerFixtureId: true,
          status: true,
          kickoff: true,
          updatedAt: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
        orderBy: { kickoff: 'asc' },
        take: 600,
      }),
      // Query recent completed matches for archive indexing (last 30 days)
      prisma.match.findMany({
        where: {
          OR: [
            { isFinal: true },
            { status: { in: ['FT', 'AET', 'PEN'] } },
          ],
          kickoff: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
          homeTeam: { name: { not: '' } },
          awayTeam: { name: { not: '' } },
        },
        select: {
          providerFixtureId: true,
          status: true,
          kickoff: true,
          updatedAt: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
        orderBy: { kickoff: 'desc' },
        take: 600,
      }),
    ])

    if (dbArticles.length > 0) {
      newsRoutes = dbArticles.map((article: any) => ({
        url: `${BASE_URL}/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`,
        lastModified: article.updatedAt || article.publishedAt || siteReleaseDate,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }))
    }

    // Include approved competitions using their canonical providerId or slug
    competitionRoutes = competitions.map((c: any) => {
      const approvedConfig = APPROVED_COMPETITIONS.find((ac) => ac.id === c.providerId)
      const routeSlug = approvedConfig?.slug || slugify(c.name) || String(c.providerId)
      return {
        url: `${BASE_URL}/league/${routeSlug}`,
        lastModified: c.updatedAt || siteReleaseDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }
    })

    teamRoutes = teams.map((t: any) => ({
      url: `${BASE_URL}/team/${slugify(t.name) || t.providerId}`,
      lastModified: t.updatedAt || siteReleaseDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Combine upcoming and completed matches, de-duplicating by providerFixtureId
    const seenFixtures = new Set<number>()
    const combinedMatches = [...matches, ...completedMatches].filter((m: any) => {
      if (!m.providerFixtureId || seenFixtures.has(m.providerFixtureId)) return false
      seenFixtures.add(m.providerFixtureId)
      return true
    })

    matchRoutes = combinedMatches.map((m: any) => {
      const isUpcoming = m.status === 'NS' || m.status === 'TBD'
      const isLive = ['1H', '2H', 'HT', 'LIVE'].includes(m.status)
      const matchSlug = (m.homeTeam?.name && m.awayTeam?.name)
        ? buildMatchSlug(m.homeTeam.name, m.awayTeam.name, m.providerFixtureId)
        : String(m.providerFixtureId)

      return {
        url: `${BASE_URL}/match/${matchSlug}`,
        lastModified: m.updatedAt || m.kickoff || siteReleaseDate,
        changeFrequency: isLive ? ('always' as const) : isUpcoming ? ('hourly' as const) : ('monthly' as const),
        priority: isLive ? 0.9 : isUpcoming ? 0.85 : 0.6,
      }
    })
  } catch (err) {
    console.error('[Sitemap Generator] Database query failed, using static sitemap only:', err)
  }

  // 3. Key Manifest Players
  let playerRoutes: MetadataRoute.Sitemap = []
  try {
    const { getAllManifestPlayers } = await import('@/lib/playerMatcher')
    const manifestPlayers = getAllManifestPlayers()
    playerRoutes = manifestPlayers.map((p) => ({
      url: `${BASE_URL}/player/${p.slug}`,
      lastModified: p.collected_at ? new Date(p.collected_at) : siteReleaseDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // If manifest not loaded, skip
  }

  // News articles are placed immediately after core static pages for maximum crawl visibility
  const allEntries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...newsRoutes,
    ...competitionRoutes,
    ...teamRoutes,
    ...matchRoutes,
    ...playerRoutes,
  ]

  // Enforce absolute URL uniqueness
  const uniqueUrlMap = new Map<string, MetadataRoute.Sitemap[number]>()
  for (const entry of allEntries) {
    if (!uniqueUrlMap.has(entry.url)) {
      uniqueUrlMap.set(entry.url, entry)
    }
  }

  return Array.from(uniqueUrlMap.values())
}
