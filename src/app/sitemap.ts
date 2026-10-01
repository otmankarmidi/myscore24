import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

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
    const [dbArticles, competitions, teams, matches] = await Promise.all([
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
      prisma.match.findMany({
        where: {
          OR: [{ isFinal: true }, { status: 'scheduled' }],
        },
        select: { providerFixtureId: true, updatedAt: true },
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

    matchRoutes = matches.map((m: any) => ({
      url: `${BASE_URL}/match/${m.providerFixtureId}`,
      lastModified: m.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
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
