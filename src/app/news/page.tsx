import { Metadata } from 'next'
import NewsClient from './NewsClient'
import { getPublishedArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Football News, Transfer Rumours & Tactical Analysis | MyScore24',
  description:
    'Stay updated with the latest breaking football news, confirmed transfer rumours, comprehensive match previews, and in-depth tactical analysis on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com/news',
  },
  openGraph: {
    title: 'Football News, Transfer Rumours & Tactical Analysis | MyScore24',
    description:
      'Stay updated with the latest breaking football news, confirmed transfer rumours, comprehensive match previews, and in-depth tactical analysis on MyScore24.',
    url: 'https://myscore24.com/news',
    type: 'website',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyScore24 Football News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football News, Transfer Rumours & Tactical Analysis | MyScore24',
    description:
      'Stay updated with the latest breaking football news, confirmed transfer rumours, comprehensive match previews, and in-depth tactical analysis on MyScore24.',
    images: ['/og-image.png'],
  },
}

export default async function NewsPage() {
  const articles = await getPublishedArticles()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://myscore24.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: 'https://myscore24.com/news',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsClient initialArticles={articles} />
    </>
  )
}
