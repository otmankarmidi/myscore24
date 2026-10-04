import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getArticleBySlug, getPublishedArticles, safeDecodeFully } from '@/lib/articles'
import ArticleBodyRenderer from '@/components/news/ArticleBodyRenderer'
import NewsArticleClient from '@/app/news/[slug]/NewsArticleClient'
import { getArticleOgImageUrl } from '@/lib/newsImage'

export const dynamic = 'force-dynamic'

interface LocalizedArticlePageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: LocalizedArticlePageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const decodedSlug = safeDecodeFully(slug)

  if (lang !== 'en' && lang !== 'ar') {
    return {
      title: 'Article Not Found | MyScore24',
      robots: { index: false, follow: false },
    }
  }

  const { article, metaTitle, metaDescription } = await getArticleBySlug(decodedSlug, lang)

  if (!article) {
    return {
      title: 'Article Not Found | MyScore24',
      description: 'The requested football article could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const isAr = lang === 'ar'
  const title = metaTitle || `${article.title} | MyScore24`
  const description = metaDescription || article.excerpt
  const canonical = `https://www.myscore24.com/${lang}/news/${encodeURIComponent(article.slug)}`
  const ogImageUrl = getArticleOgImageUrl(article.imageUrl || article.image)
  const isWebp = ogImageUrl.toLowerCase().endsWith('.webp')
  const isPng = ogImageUrl.toLowerCase().endsWith('.png')
  const mimeType = isWebp ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg'

  // Configure hreflang alternates if published translations exist
  const languageAlternates: Record<string, string> = {
    [lang]: canonical,
  }

  if (article.translations && article.translations.length > 0) {
    for (const tr of article.translations) {
      if (tr.status === 'PUBLISHED') {
        languageAlternates[tr.language] = `https://www.myscore24.com/${tr.language}/news/${encodeURIComponent(tr.slug)}`
      }
    }
  }

  // Set x-default to English version if available, or current canonical
  const xDefault = languageAlternates['en'] || canonical
  languageAlternates['x-default'] = xDefault

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'MyScore24',
      locale: isAr ? 'ar_AR' : 'en_US',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      section: article.category,
      tags: article.tags,
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
      site: '@MyScore24',
      creator: '@MyScore24',
    },
  }
}

export default async function LocalizedArticlePage({ params }: LocalizedArticlePageProps) {
  const { lang, slug } = await params
  if (lang !== 'en' && lang !== 'ar') {
    notFound()
  }

  const decodedSlug = safeDecodeFully(slug)
  const { article, competition, team, playerId, matchId, matchSlug } = await getArticleBySlug(decodedSlug, lang)

  if (!article) {
    notFound()
  }

  // If article belongs to another language, redirect permanently to its correct URL
  if (article.language && article.language !== lang) {
    // Check if there is an active translation in the requested language
    const requestedSibling = article.translations?.find(
      (t) => t.language === lang && t.status === 'PUBLISHED'
    )
    if (requestedSibling) {
      permanentRedirect(`https://www.myscore24.com/${lang}/news/${encodeURIComponent(requestedSibling.slug)}`)
    } else {
      permanentRedirect(`https://www.myscore24.com/${article.language}/news/${encodeURIComponent(article.slug)}`)
    }
  }

  const isAr = lang === 'ar'

  // Fetch related articles in the same language
  const allArticles = await getPublishedArticles(lang)
  const relatedNews = allArticles.filter((n) => n.id !== article.id).slice(0, 2)

  const authorName =
    typeof article.author === 'string'
      ? article.author
      : article.author?.name || (isAr ? 'مكتب تحرير MyScore24' : 'MyScore24 Desk')
  const ogImageUrl = getArticleOgImageUrl(article.imageUrl || article.image)

  const newsArticleSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    inLanguage: lang,
    image: [ogImageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [
      {
        '@type': 'Person',
        name: authorName,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'MyScore24',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.myscore24.com/og-image.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.myscore24.com/${lang}/news/${encodeURIComponent(article.slug)}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isAr ? 'الرئيسية' : 'Home',
        item: 'https://www.myscore24.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isAr ? 'الأخبار' : 'News',
        item: `https://www.myscore24.com/${lang}/news`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://www.myscore24.com/${lang}/news/${encodeURIComponent(article.slug)}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsArticleClient
        article={article}
        relatedNews={relatedNews}
        linkedEntity={{ competition, team, playerId, matchId, matchSlug }}
      >
        <ArticleBodyRenderer content={article.content} />
      </NewsArticleClient>
    </>
  )
}
