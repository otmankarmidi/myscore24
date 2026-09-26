import { Metadata } from 'next'
import HomeClient from './HomeClient'
import { getInitialTrendingMatches } from '@/lib/football/trending'

export const metadata: Metadata = {
  title: 'Football Live Scores, Results & Fixtures | MyScore24',
  description:
    'Real-time live football scores, fixtures, results, standings, and match statistics from top competitions around the world on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com',
  },
  openGraph: {
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Real-time live football scores, fixtures, results, standings, and match statistics from top competitions around the world on MyScore24.',
    url: 'https://myscore24.com',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyScore24 Live Football Scores',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Real-time live football scores, fixtures, results, standings, and match statistics.',
    images: ['/og-image.png'],
  },
}

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://myscore24.com/#website',
      url: 'https://myscore24.com',
      name: 'MyScore24',
      description: 'Football Live Scores, Results & Fixtures',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://myscore24.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://myscore24.com/#organization',
      name: 'MyScore24',
      url: 'https://myscore24.com',
      logo: 'https://myscore24.com/logo.png',
      sameAs: [],
    },
  ],
}

export default async function Page() {
  const initialTrendingMatches = await getInitialTrendingMatches()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <HomeClient initialTrendingMatches={initialTrendingMatches} />
    </>
  )
}
