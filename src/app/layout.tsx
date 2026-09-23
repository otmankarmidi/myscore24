import type { Metadata } from 'next'
import './globals.css'
import { LiveAlertManager } from '@/components/common/LiveAlertManager'
import { TimezoneProvider } from '@/context/TimezoneContext'
import { LanguageProvider } from '@/context/LanguageContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://myscore24.com'),
  title: {
    default: 'Football Live Scores, Results & Fixtures | MyScore24',
    template: '%s',
  },
  description:
    'Fastest real-time live football scores, match statistics, lineups, head-to-head records, league standings, and sports news across major global leagues.',
  keywords: [
    'live scores',
    'football scores',
    'soccer live',
    'premier league',
    'champions league',
    'match statistics',
    'lineups',
    'standings',
  ],
  authors: [{ name: 'MyScore24 Team' }],
  alternates: {
    canonical: 'https://myscore24.com',
  },
  openGraph: {
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Fastest real-time live football scores, match statistics, lineups, head-to-head records, and league standings on MyScore24.',
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
      'Fastest real-time live football scores, match statistics, lineups, and league standings.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var l = localStorage.getItem('myscore24_locale');
                if (l === 'ar') {
                  document.documentElement.lang = 'ar';
                  document.documentElement.dir = 'rtl';
                } else if (l === 'fr') {
                  document.documentElement.lang = 'fr';
                  document.documentElement.dir = 'ltr';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-inter antialiased">
        <LanguageProvider>
          <TimezoneProvider>
            {children}
            <LiveAlertManager />
          </TimezoneProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
