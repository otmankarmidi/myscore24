import { Metadata } from 'next'
import { permanentRedirect, notFound } from 'next/navigation'
import { getArticleBySlug, safeDecodeFully } from '@/lib/articles'
import { getArticleOgImageUrl } from '@/lib/newsImage'

export const dynamic = 'force-dynamic'

interface LegacyArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LegacyArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = safeDecodeFully(slug)
  const { article, metaTitle, metaDescription } = await getArticleBySlug(decodedSlug)

  if (!article) {
    return {
      title: 'Article Not Found | MyScore24',
      robots: { index: false, follow: false },
    }
  }

  const targetLang = article.language || 'en'
  const isAr = targetLang === 'ar'
  const title = metaTitle || `${article.title} | MyScore24`
  const description = metaDescription || article.excerpt
  const canonical = `https://www.myscore24.com/${targetLang}/news/${encodeURIComponent(article.slug)}`
  const ogImageUrl = getArticleOgImageUrl(article.imageUrl || article.image)
  const isWebp = ogImageUrl.toLowerCase().endsWith('.webp')
  const isPng = ogImageUrl.toLowerCase().endsWith('.png')
  const mimeType = isWebp ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg'

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'MyScore24',
      locale: isAr ? 'ar_AR' : 'en_US',
      publishedTime: article.publishedAt,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: mimeType,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function LegacyNewsArticlePage({ params }: LegacyArticlePageProps) {
  const { slug } = await params
  const decodedSlug = safeDecodeFully(slug)

  const { article } = await getArticleBySlug(decodedSlug)

  if (!article) {
    notFound()
  }

  const targetLang = article.language || 'en'
  permanentRedirect(`https://www.myscore24.com/${targetLang}/news/${encodeURIComponent(article.slug)}`)
}
