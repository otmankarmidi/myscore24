import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'
import { ArticleStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/articles - List articles with filters
export async function GET(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ArticleStatus | null
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'].includes(status)) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { excerpt: { contains: search.trim() } },
        { slug: { contains: search.trim() } },
      ]
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true, slug: true, avatar: true } },
          tags: {
            include: {
              tag: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ])

    const formattedArticles = articles.map((art: any) => ({
      ...art,
      tags: art.tags.map((t: any) => t.tag),
    }))

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (err: any) {
    console.error('[Articles GET error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/articles - Create article
export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      status = 'DRAFT',
      publishedAt,
      scheduledAt,
      metaTitle,
      metaDescription,
      categoryId,
      authorId,
      tags = [],
      competitionId,
      teamId,
      playerId,
      matchId,
    } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Article title is required' }, { status: 400 })
    }

    let finalSlug = slugify(customSlug || title)
    if (!finalSlug) {
      finalSlug = `article-${Date.now()}`
    }

    // Ensure slug uniqueness
    let slugCandidate = finalSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug: slugCandidate } })) {
      slugCandidate = `${finalSlug}-${counter}`
      counter++
    }
    finalSlug = slugCandidate

    // Determine publish timestamp
    let finalPublishedAt: Date | null = null
    if (status === 'PUBLISHED') {
      finalPublishedAt = publishedAt ? new Date(publishedAt) : new Date()
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt)
    }

    const finalScheduledAt = scheduledAt ? new Date(scheduledAt) : null

    // Ensure Author exists or pick first author
    let validAuthorId = authorId
    if (!validAuthorId) {
      const defaultAuthor = await prisma.author.findFirst()
      if (defaultAuthor) validAuthorId = defaultAuthor.id
    }

    // Ensure Category exists or pick first category
    let validCategoryId = categoryId
    if (!validCategoryId) {
      const defaultCategory = await prisma.category.findFirst()
      if (defaultCategory) validCategoryId = defaultCategory.id
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt?.trim() || title.trim(),
        content: content?.trim() || '',
        featuredImage: featuredImage?.trim() || null,
        status: status as ArticleStatus,
        publishedAt: finalPublishedAt,
        scheduledAt: finalScheduledAt,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        categoryId: validCategoryId || null,
        authorId: validAuthorId || null,
        competitionId: competitionId ? String(competitionId) : null,
        teamId: teamId ? String(teamId) : null,
        playerId: playerId ? String(playerId) : null,
        matchId: matchId ? String(matchId) : null,
      },
    })

    // Associate tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const rawTag of tags) {
        const tagName = typeof rawTag === 'string' ? rawTag.trim() : rawTag?.name?.trim()
        if (!tagName) continue
        const tagSlug = slugify(tagName)
        if (!tagSlug) continue

        let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } })
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug: tagSlug },
          })
        }

        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: article.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            articleId: article.id,
            tagId: tag.id,
          },
        })
      }
    }

    const createdArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({
      success: true,
      article: {
        ...createdArticle,
        tags: createdArticle?.tags.map((t: any) => t.tag) || [],
      },
    })
  } catch (err: any) {
    console.error('[Article Create Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to create article' }, { status: 500 })
  }
}
