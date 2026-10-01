import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

export async function GET() {
  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  let articles: Array<{
    slug: string
    title: string
    language: string
    publishedAt: Date | null
  }> = []

  try {
    articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: fortyEightHoursAgo,
          lte: now,
        },
      },
      select: {
        slug: true,
        title: true,
        language: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 1000,
    })
  } catch (error) {
    console.error('[News Sitemap Generator] Failed to fetch articles:', error)
  }

  const BASE_URL = 'https://www.myscore24.com'

  const urlEntries = articles
    .map((article) => {
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : now.toISOString()
      const escapedTitle = escapeXml(article.title || '')
      const articleLang = article.language === 'ar' ? 'ar' : 'en'
      const loc = `${BASE_URL}/${articleLang}/news/${encodeURIComponent(article.slug)}`

      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>MyScore24</news:name>
        <news:language>${articleLang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    },
  })
}
