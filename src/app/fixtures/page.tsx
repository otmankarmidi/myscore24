import { Metadata } from 'next'
import FixturesClient from './FixturesClient'

export const metadata: Metadata = {
  title: 'Football Fixtures & Upcoming Matches | MyScore24',
  description:
    'Find upcoming football fixtures, kickoff schedules, match previews, and tournament calendars across all major leagues on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com/fixtures',
  },
  openGraph: {
    title: 'Football Fixtures & Upcoming Matches | MyScore24',
    description:
      'Find upcoming football fixtures, kickoff schedules, match previews, and tournament calendars across all major leagues on MyScore24.',
    url: 'https://myscore24.com/fixtures',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Football Fixtures - MyScore24',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Fixtures & Upcoming Matches | MyScore24',
    description: 'Upcoming football fixtures and kickoff schedules.',
    images: ['/og-image.png'],
  },
}

export default function Page() {
  return <FixturesClient />
}
