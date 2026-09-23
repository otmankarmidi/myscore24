import { Metadata } from 'next'
import LiveClient from './LiveClient'

export const metadata: Metadata = {
  title: 'Live Football Scores Today | MyScore24',
  description:
    'Track live football scores today with instant goal alerts, in-play statistics, match minutes, and live commentary across top world leagues on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com/live',
  },
  openGraph: {
    title: 'Live Football Scores Today | MyScore24',
    description:
      'Track live football scores today with instant goal alerts, in-play statistics, match minutes, and live commentary across top world leagues on MyScore24.',
    url: 'https://myscore24.com/live',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Live Football Scores Today - MyScore24',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Football Scores Today | MyScore24',
    description: 'Track live football scores today in real time with instant match statistics.',
    images: ['/og-image.png'],
  },
}

export default function Page() {
  return <LiveClient />
}
