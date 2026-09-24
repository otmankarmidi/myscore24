import { prisma } from '@/lib/prisma'
import { NewsArticle } from '@/types/news'

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function mapPrismaToNewsArticle(art: any): NewsArticle {
  return {
    id: art.id,
    slug: art.slug,
    title: art.title,
    excerpt: art.excerpt,
    content: art.content,
    author: {
      name: art.author?.name || 'MyScore24 Desk',
      avatar: art.author?.avatar || undefined,
      role: art.author?.role || 'Staff Writer',
    },
    publishedAt: art.publishedAt ? new Date(art.publishedAt).toISOString() : new Date(art.createdAt).toISOString(),
    updatedAt: art.updatedAt ? new Date(art.updatedAt).toISOString() : undefined,
    category: art.category?.name || 'General',
    tags: art.tags ? art.tags.map((t: any) => t.tag?.name || t.name) : [],
    imageUrl: art.featuredImage || '/og-image.png',
    image: art.featuredImage || '/og-image.png',
    readTimeMinutes: estimateReadTime(art.content || ''),
    readTime: estimateReadTime(art.content || ''),
  }
}

export async function getPublishedArticles(): Promise<NewsArticle[]> {
  try {
    const dbArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
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
      return dbArticles.map(mapPrismaToNewsArticle)
    }
  } catch (err) {
    console.error('[getPublishedArticles] MySQL query failed:', err)
  }

  // Only return real articles published via CMS
  return []
}

export async function getArticleBySlug(slug: string): Promise<{
  article: NewsArticle | null
  metaTitle?: string | null
  metaDescription?: string | null
  competition?: { id: string; name: string; logo: string | null } | null
  team?: { id: string; name: string; logo: string | null } | null
  playerId?: string | null
  matchId?: string | null
}> {
  try {
    const dbArticle = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        tags: {
          include: { tag: true },
        },
      },
    })

    if (dbArticle && dbArticle.status === 'PUBLISHED') {
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

      return {
        article: mapPrismaToNewsArticle(dbArticle),
        metaTitle: dbArticle.metaTitle,
        metaDescription: dbArticle.metaDescription,
        competition,
        team,
        playerId: dbArticle.playerId,
        matchId: dbArticle.matchId,
      }
    }
  } catch (err) {
    console.error(`[getArticleBySlug] MySQL query for slug "${slug}" failed:`, err)
  }

  return { article: null }
}
