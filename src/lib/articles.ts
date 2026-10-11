import { prisma } from '@/lib/prisma'
import { NewsArticle, ArticleTranslationRef } from '@/types/news'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { buildMatchSlug } from '@/lib/football/matchUrl'

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function mapPrismaToNewsArticle(art: any, translations?: ArticleTranslationRef[]): NewsArticle {
  const normalizedImage = normalizeArticleImageUrl(art.featuredImage) || undefined

  return {
    id: art.id,
    slug: art.slug,
    title: art.title,
    excerpt: art.excerpt,
    content: art.content,
    language: art.language || 'en',
    translationGroupId: art.translationGroupId || null,
    translations: translations || [],
    author: {
      name: art.author?.name || 'MyScore24 Desk',
      avatar: art.author?.avatar || undefined,
      role: art.author?.role || 'Staff Writer',
    },
    publishedAt: art.publishedAt ? new Date(art.publishedAt).toISOString() : new Date(art.createdAt).toISOString(),
    updatedAt: art.updatedAt ? new Date(art.updatedAt).toISOString() : undefined,
    category: art.category?.name || 'General',
    tags: art.tags ? art.tags.map((t: any) => t.tag?.name || t.name) : [],
    keywords: Array.isArray(art.keywords)
      ? art.keywords.map((k: any) => String(k).trim()).filter(Boolean)
      : [],
    imageUrl: normalizedImage,
    image: normalizedImage,
    readTimeMinutes: estimateReadTime(art.content || ''),
    readTime: estimateReadTime(art.content || ''),
  }
}

export async function getPublishedArticles(language?: string): Promise<NewsArticle[]> {
  try {
    const whereClause: any = {
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date(Date.now() + 60 * 1000),
      },
    }

    if (language) {
      whereClause.language = language
    }

    const dbArticles = await prisma.article.findMany({
      where: whereClause,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        category: true,
        author: true,
        tags: {
          include: { tag: true },
        },
      },
    })

    if (dbArticles.length > 0) {
      return dbArticles.map((art: any) => mapPrismaToNewsArticle(art))
    }
  } catch (err) {
    console.error('[getPublishedArticles] MySQL query failed:', err)
  }

  // Only return real articles published via CMS
  return []
}

/**
 * Fast, lightweight query specifically for the Homepage Latest News section.
 * Limits to top N articles by language and avoids loading heavy tags or unnecessary relations.
 */
export async function getHomepageLatestArticles(
  limit: number = 6,
  language: string = 'en'
): Promise<NewsArticle[]> {
  try {
    const dbArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(Date.now() + 60 * 1000),
        },
        language: language,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        category: true,
        author: true,
      },
    })

    if (dbArticles.length > 0) {
      return dbArticles.map((art: any) => mapPrismaToNewsArticle(art))
    }
  } catch (err) {
    console.error('[getHomepageLatestArticles] MySQL query failed:', err)
  }

  return []
}

export function safeDecodeFully(str: string): string {
  let current = str
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    } catch {
      break
    }
  }
  return current
}

export async function getArticleBySlug(
  slug: string,
  language?: string
): Promise<{
  article: NewsArticle | null
  metaTitle?: string | null
  metaDescription?: string | null
  competition?: { id: string; name: string; logo: string | null } | null
  team?: { id: string; name: string; logo: string | null } | null
  playerId?: string | null
  matchId?: string | null
  matchSlug?: string | null
}> {
  try {
    const decodedSlug = safeDecodeFully(slug)
    const encodedSlug = encodeURIComponent(decodedSlug)
    const slugCandidates = Array.from(new Set([slug, decodedSlug, encodedSlug])).filter(Boolean)

    let dbArticle = await prisma.article.findFirst({
      where: {
        slug: { in: slugCandidates },
        ...(language ? { language } : {}),
      },
      include: {
        category: true,
        author: true,
        tags: {
          include: { tag: true },
        },
      },
    })

    // Fallback if language specified but not found on that exact language (e.g. redirect lookup)
    if (!dbArticle && language) {
      dbArticle = await prisma.article.findFirst({
        where: { slug: { in: slugCandidates } },
        include: {
          category: true,
          author: true,
          tags: {
            include: { tag: true },
          },
        },
      })
    }

    const isPublic =
      dbArticle &&
      dbArticle.status === 'PUBLISHED' &&
      (!dbArticle.publishedAt || dbArticle.publishedAt <= new Date())

    if (isPublic && dbArticle) {
      let competition = null
      let team = null

      if (dbArticle.competitionId) {
        competition = await prisma.competition.findFirst({
          where: { id: dbArticle.competitionId },
          select: { id: true, name: true, logo: true },
        })
      }

      if (dbArticle.teamId) {
        team = await prisma.team.findFirst({
          where: { id: dbArticle.teamId },
          select: { id: true, name: true, logo: true },
        })
      }

      let matchSlug: string | null = null
      if (dbArticle.matchId) {
        const fixtureNum = parseInt(dbArticle.matchId, 10)
        if (!isNaN(fixtureNum)) {
          const m = await prisma.match.findFirst({
            where: {
              OR: [
                { providerFixtureId: fixtureNum },
                { id: dbArticle.matchId },
              ],
            },
            include: { homeTeam: true, awayTeam: true },
          })
          if (m && m.homeTeam && m.awayTeam) {
            matchSlug = buildMatchSlug(m.homeTeam.name, m.awayTeam.name, m.providerFixtureId)
          }
        }
      }

      // Fetch linked translations if part of a translation group
      let siblingTranslations: ArticleTranslationRef[] = []
      if (dbArticle.translationGroupId) {
        siblingTranslations = await prisma.article.findMany({
          where: {
            translationGroupId: dbArticle.translationGroupId,
            status: 'PUBLISHED',
            publishedAt: { lte: new Date(Date.now() + 60 * 1000) },
            id: { not: dbArticle.id },
          },
          select: {
            id: true,
            slug: true,
            language: true,
            title: true,
            status: true,
          },
        })
      }

      return {
        article: mapPrismaToNewsArticle(dbArticle, siblingTranslations),
        metaTitle: dbArticle.metaTitle,
        metaDescription: dbArticle.metaDescription,
        competition,
        team,
        playerId: dbArticle.playerId,
        matchId: dbArticle.matchId,
        matchSlug,
      }
    }
  } catch (err) {
    console.error(`[getArticleBySlug] MySQL query for slug "${slug}" failed:`, err)
  }

  return { article: null }
}
