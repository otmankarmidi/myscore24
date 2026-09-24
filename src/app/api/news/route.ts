import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function estimateReadTime(text: string): number {
  const words = text ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(words / 200))
}

function formatArticle(art: any) {
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
    competitionId: art.competitionId,
    teamId: art.teamId,
    playerId: art.playerId,
    matchId: art.matchId,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const leagueId = searchParams.get('leagueId')
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)))

    const where: any = {
      status: 'PUBLISHED',
    }

    if (slug) {
      where.slug = slug
      const art = await prisma.article.findFirst({
        where,
        include: {
          category: true,
          author: true,
          tags: { include: { tag: true } },
        },
      })
      if (!art) {
        return NextResponse.json({ article: null, articles: [] })
      }
      const formatted = formatArticle(art)
      return NextResponse.json({ article: formatted, articles: [formatted] })
    }

    if (leagueId) {
      where.competitionId = leagueId
    }

    if (category && category.toLowerCase() !== 'all') {
      where.category = {
        name: {
          equals: category,
        },
      }
    }

    const dbArticles = await prisma.article.findMany({
      where,
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({
      articles: dbArticles.map(formatArticle),
    })
  } catch (err: any) {
    console.error('Failed to get public news articles:', err)
    return NextResponse.json({ articles: [] })
  }
}
