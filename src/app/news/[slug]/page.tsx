import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getPublishedArticles } from '@/lib/articles'
import ArticleBodyRenderer from '@/components/news/ArticleBodyRenderer'
import NewsArticleClient from './NewsArticleClient'

export const dynamic = 'force-dynamic'

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const { article, metaTitle, metaDescription } = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found | MyScore24',
      description: 'The requested football article could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const title = metaTitle || `${article.title} | MyScore24`
  const description = metaDescription || article.excerpt
  const canonical = `https://www.myscore24.com/news/${slug}`
  const imageUrl = article.imageUrl || article.image || '/og-image.png'
  const keywordsList = Array.isArray(article.keywords)
    ? article.keywords.map((k) => String(k).trim()).filter(Boolean)
    : []

  return {
    title,
    description,
    keywords: keywordsList.length > 0 ? [keywordsList.join(', ')] : null,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'MyScore24',
      publishedTime: article.publishedAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params
  const { article, competition, team, playerId, matchId } = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Fetch related articles
  const allArticles = await getPublishedArticles()
  const relatedNews = allArticles.filter((n) => n.id !== article.id).slice(0, 2)

  const authorName =
    typeof article.author === 'string'
      ? article.author
      : article.author?.name || 'MyScore24 Desk'
  const imageUrl = article.imageUrl || article.image || 'https://www.myscore24.com/og-image.png'

  const keywordsList = Array.isArray(article.keywords)
    ? article.keywords.map((k) => String(k).trim()).filter(Boolean)
    : []

  const newsArticleSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    ...(keywordsList.length > 0 ? { keywords: keywordsList } : {}),
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
      '@id': `https://www.myscore24.com/news/${slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.myscore24.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: 'https://www.myscore24.com/news',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://www.myscore24.com/news/${slug}`,
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
        linkedEntity={{ competition, team, playerId, matchId }}
      >
        <ArticleBodyRenderer content={article.content} />
      </NewsArticleClient>
    </>
  )
}
