import { Metadata } from 'next'
import ResultsClient from './ResultsClient'

export const metadata: Metadata = {
  title: 'Football Results | MyScore24',
  description:
    'Latest football match results, full-time scores, goal scorers, match summaries, and historical match archives on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com/results',
  },
  openGraph: {
    title: 'Football Results | MyScore24',
    description:
      'Latest football match results, full-time scores, goal scorers, match summaries, and historical match archives on MyScore24.',
    url: 'https://myscore24.com/results',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Football Results - MyScore24',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Results | MyScore24',
    description: 'Latest football results and full-time match scores.',
    images: ['/og-image.png'],
  },
}

export default function Page() {
  return <ResultsClient />
}
