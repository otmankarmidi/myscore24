import { Metadata } from 'next'
import CompetitionsClient from './CompetitionsClient'

export const metadata: Metadata = {
  title: 'Football Competitions & Leagues | MyScore24',
  description:
    'Browse global football leagues, cups, tournaments, and championships covered on MyScore24. Access standings, fixtures, results, and team statistics.',
  alternates: {
    canonical: 'https://myscore24.com/competitions',
  },
  openGraph: {
    title: 'Football Competitions & Leagues | MyScore24',
    description:
      'Browse global football leagues, cups, tournaments, and championships covered on MyScore24.',
    url: 'https://myscore24.com/competitions',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Football Competitions - MyScore24',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Competitions & Leagues | MyScore24',
    description: 'Browse global football leagues and tournaments.',
    images: ['/og-image.png'],
  },
}

export default function Page() {
  return <CompetitionsClient />
}
