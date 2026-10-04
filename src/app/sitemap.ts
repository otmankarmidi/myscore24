import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { buildMatchSlug } from '@/lib/football/matchUrl'

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

  // 1. Static Core Public Pages
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
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
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
        select: { providerId: true, name: true, updatedAt: true },
        take: 200,
      }),
      prisma.team.findMany({
        select: { providerId: true, name: true, updatedAt: true },
        take: 500,
      }),
      // Query upcoming matches first (priority indexing for pre-match SEO)
      prisma.match.findMany({
        where: {
          status: { in: ['NS', 'TBD', '1H', '2H', 'HT', 'LIVE'] },
          kickoff: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
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
        take: 1500,
      }),
      // Query recent completed matches for archive indexing
      prisma.match.findMany({
        where: {
          OR: [
            { isFinal: true },
            { status: { in: ['FT', 'AET', 'PEN'] } },
          ],
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
        take: 1500,
      }),
    ])

    if (dbArticles.length > 0) {
      newsRoutes = dbArticles.map((article: any) => ({
        url: `${BASE_URL}/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`,
        lastModified: article.updatedAt || article.publishedAt || now,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }))
    }

    competitionRoutes = competitions.map((c: any) => ({
      url: `${BASE_URL}/league/${slugify(c.name) || c.providerId}`,
      lastModified: c.updatedAt || now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    teamRoutes = teams.map((t: any) => ({
      url: `${BASE_URL}/team/${slugify(t.name) || t.providerId}`,
      lastModified: t.updatedAt || now,
      changeFrequency: 'daily' as const,
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
        lastModified: m.updatedAt || now,
        changeFrequency: isLive ? ('always' as const) : isUpcoming ? ('hourly' as const) : ('weekly' as const),
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
      lastModified: now,
      changeFrequency: 'weekly' as const,
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
