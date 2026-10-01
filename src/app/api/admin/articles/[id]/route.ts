import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'
import { ArticleStatus, Prisma } from '@prisma/client'
import { sanitizeArticleContent } from '@/lib/socialEmbed/serverSanitizer'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
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

    let translations: Array<{ id: string; title: string; slug: string; language: string; status: string }> = []
    if (article.translationGroupId) {
      translations = await prisma.article.findMany({
        where: {
          translationGroupId: article.translationGroupId,
          id: { not: article.id },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          language: true,
          status: true,
        },
      })
    }

    return NextResponse.json({
      article: {
        ...article,
        language: article.language || 'en',
        translationGroupId: article.translationGroupId || null,
        translations,
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
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
      language,
      translationGroupId,
      status,
      publishedAt,
      scheduledAt,
      metaTitle,
      metaDescription,
      keywords,
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

    const finalLanguage =
      language !== undefined
        ? language === 'ar' || language === 'fr'
          ? language
          : 'en'
        : existingArticle.language || 'en'

    // Update article
    await prisma.article.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingArticle.title,
        slug: newSlug,
        excerpt: excerpt !== undefined ? excerpt.trim() : existingArticle.excerpt,
        content: finalContent,
        featuredImage: featuredImage !== undefined ? (featuredImage ? featuredImage.trim() : null) : existingArticle.featuredImage,
        language: finalLanguage,
        translationGroupId: translationGroupId !== undefined ? translationGroupId : existingArticle.translationGroupId,
        status: status ? (status as ArticleStatus) : existingArticle.status,
        publishedAt: finalPublishedAt,
        scheduledAt: finalScheduledAt,
        metaTitle: metaTitle !== undefined ? (metaTitle ? metaTitle.trim() : null) : existingArticle.metaTitle,
        metaDescription: metaDescription !== undefined ? (metaDescription ? metaDescription.trim() : null) : existingArticle.metaDescription,
        keywords: keywords !== undefined
          ? (Array.isArray(keywords) ? keywords.map((k: any) => String(k).trim()).filter(Boolean) : Prisma.DbNull)
          : undefined,
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

    // Revalidate public news pages and sitemaps
    try {
      revalidatePath(`/${finalLanguage}/news`)
      if (refreshed?.slug) {
        revalidatePath(`/${finalLanguage}/news/${encodeURIComponent(refreshed.slug)}`)
      }
      if (existingArticle.slug && existingArticle.slug !== refreshed?.slug) {
        revalidatePath(`/${existingArticle.language || 'en'}/news/${encodeURIComponent(existingArticle.slug)}`)
      }
      revalidatePath('/en/news')
      revalidatePath('/ar/news')
      revalidatePath('/sitemap.xml')
      revalidatePath('/news-sitemap.xml')
      revalidatePath('/')
    } catch (revalErr) {
      console.error('[Article Revalidation Error]', revalErr)
    }

    return NextResponse.json({
      success: true,
      article: {
        ...refreshed,
        language: refreshed?.language || finalLanguage,
        translationGroupId: refreshed?.translationGroupId || null,
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

    // Revalidate public news pages and sitemaps
    try {
      const lang = existing.language || 'en'
      revalidatePath(`/${lang}/news`)
      if (existing.slug) {
        revalidatePath(`/${lang}/news/${encodeURIComponent(existing.slug)}`)
      }
      revalidatePath('/en/news')
      revalidatePath('/ar/news')
      revalidatePath('/sitemap.xml')
      revalidatePath('/news-sitemap.xml')
      revalidatePath('/')
    } catch (revalErr) {
      console.error('[Article Revalidation Error]', revalErr)
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (err: any) {
    console.error('[Article Delete Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to delete article' }, { status: 500 })
  }
}
