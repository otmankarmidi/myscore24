import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'
import { ArticleStatus } from '@prisma/client'
import { sanitizeArticleContent } from '@/lib/socialEmbed/serverSanitizer'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/admin/articles/[id]
export async function GET(req: NextRequest, { params }: Params) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        tags: {
          include: { tag: true },
        },
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({
      article: {
        ...article,
        tags: article.tags.map((t: any) => t.tag),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/admin/articles/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      status,
      publishedAt,
      scheduledAt,
      metaTitle,
      metaDescription,
      categoryId,
      authorId,
      tags,
      competitionId,
      teamId,
      playerId,
      matchId,
    } = body

    const existingArticle = await prisma.article.findUnique({ where: { id } })
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Slug management
    let newSlug = existingArticle.slug
    if (customSlug && customSlug !== existingArticle.slug) {
      newSlug = slugify(customSlug)
      // Check collision
      const slugClash = await prisma.article.findFirst({
        where: { slug: newSlug, id: { not: id } },
      })
      if (slugClash) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`
      }
    }

    // Published date logic
    let finalPublishedAt = existingArticle.publishedAt
    if (status === 'PUBLISHED' && !finalPublishedAt) {
      finalPublishedAt = publishedAt ? new Date(publishedAt) : new Date()
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt)
    }

    const finalScheduledAt = scheduledAt ? new Date(scheduledAt) : null

    // Validate and sanitize content if updating
    let finalContent = existingArticle.content
    if (content !== undefined) {
      const sanitizeResult = sanitizeArticleContent(content || '')
      if (!sanitizeResult.valid) {
        return NextResponse.json({ error: sanitizeResult.error }, { status: 400 })
      }
      finalContent = sanitizeResult.sanitizedContent
    }

    // Update article
    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingArticle.title,
        slug: newSlug,
        excerpt: excerpt !== undefined ? excerpt.trim() : existingArticle.excerpt,
        content: finalContent,
        featuredImage: featuredImage !== undefined ? (featuredImage ? featuredImage.trim() : null) : existingArticle.featuredImage,
        status: status ? (status as ArticleStatus) : existingArticle.status,
        publishedAt: finalPublishedAt,
        scheduledAt: finalScheduledAt,
        metaTitle: metaTitle !== undefined ? (metaTitle ? metaTitle.trim() : null) : existingArticle.metaTitle,
        metaDescription: metaDescription !== undefined ? (metaDescription ? metaDescription.trim() : null) : existingArticle.metaDescription,
        categoryId: categoryId !== undefined ? categoryId : existingArticle.categoryId,
        authorId: authorId !== undefined ? authorId : existingArticle.authorId,
        competitionId: competitionId !== undefined ? (competitionId ? String(competitionId) : null) : existingArticle.competitionId,
        teamId: teamId !== undefined ? (teamId ? String(teamId) : null) : existingArticle.teamId,
        playerId: playerId !== undefined ? (playerId ? String(playerId) : null) : existingArticle.playerId,
        matchId: matchId !== undefined ? (matchId ? String(matchId) : null) : existingArticle.matchId,
      },
    })

    // Update tags if provided
    if (Array.isArray(tags)) {
      // Clear existing tags
      await prisma.articleTag.deleteMany({ where: { articleId: id } })

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
              articleId: id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            articleId: id,
            tagId: tag.id,
          },
        })
      }
    }

    const refreshed = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({
      success: true,
      article: {
        ...refreshed,
        tags: refreshed?.tags.map((t: any) => t.tag) || [],
      },
    })
  } catch (err: any) {
    console.error('[Article Update Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to update article' }, { status: 500 })
  }
}

// DELETE /api/admin/articles/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await prisma.article.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (err: any) {
    console.error('[Article Delete Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to delete article' }, { status: 500 })
  }
}
