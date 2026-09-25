import { Metadata } from 'next'
import { getStoredMatchByFixtureId } from '@/lib/football/persistence/queries'
import MatchDetailClient from './MatchDetailClient'

interface MatchPageProps {
  params: Promise<{ slug: string }>
}

function extractFixtureId(slug: string): number | null {
  if (!slug) return null
  const clean = slug.replace(/^match-/, '').trim()
  const parts = clean.split('-')
  const lastPart = parts[parts.length - 1]
  const idNum = Number(lastPart)
  if (!isNaN(idNum) && idNum > 0) return idNum
  const directNum = Number(clean)
  if (!isNaN(directNum) && directNum > 0) return directNum
  return null
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { slug } = await params
  const fixtureId = extractFixtureId(slug)

  if (!fixtureId) {
    return {
      title: 'Match Not Found | MyScore24',
      description: 'The requested football match could not be found on MyScore24.',
      robots: { index: false, follow: false },
    }
  }

  // Database-only lookup — NEVER call API-Football for metadata/crawling
  const match = await getStoredMatchByFixtureId(fixtureId)

  if (!match) {
    return {
      title: 'Match Details | MyScore24',
      description: 'Live scores, football stats, lineups, and head-to-head match details on MyScore24.',
      alternates: {
        canonical: `https://myscore24.com/match/${slug}`,
      },
      robots: { index: false, follow: true },
    }
  }

  const home = match.homeTeam.name
  const away = match.awayTeam.name
  const comp = match.league.name
  const title = `${home} vs ${away} - Live Score, Stats & H2H | MyScore24`
  const description = match.isFinal
    ? `Full time result: ${home} ${match.score?.home ?? 0} - ${match.score?.away ?? 0} ${away} in ${comp}. View match statistics, lineups, and head-to-head history on MyScore24.`
    : `Follow ${home} vs ${away} in ${comp}. Live score updates, starting lineups, match timeline, and head-to-head stats on MyScore24.`
  const canonical = `https://myscore24.com/match/${slug}`

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
      type: 'website',
      siteName: 'MyScore24',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${home} vs ${away}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params
  const fixtureId = extractFixtureId(slug)

  // Database-only lookup for initial SSR hydration and JSON-LD structured data
  const initialMatch = fixtureId ? await getStoredMatchByFixtureId(fixtureId) : null

  const sportsEventSchema = initialMatch
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}`,
        startDate: initialMatch.kickoff || new Date().toISOString(),
        eventStatus: initialMatch.isFinal
          ? 'https://schema.org/EventFinished'
          : initialMatch.status === 'live'
          ? 'https://schema.org/EventLive'
          : 'https://schema.org/EventScheduled',
        homeTeam: {
          '@type': 'SportsTeam',
          name: initialMatch.homeTeam.name,
          logo: initialMatch.homeTeam.logo || undefined,
        },
        awayTeam: {
          '@type': 'SportsTeam',
          name: initialMatch.awayTeam.name,
          logo: initialMatch.awayTeam.logo || undefined,
        },
        location: {
          '@type': 'Place',
          name: initialMatch.venue || `${initialMatch.homeTeam.name} Home Stadium`,
          address: {
            '@type': 'PostalAddress',
            addressCountry: initialMatch.league.country || 'Global',
          },
        },
        organizer: {
          '@type': 'SportsOrganization',
          name: initialMatch.league.name,
        },
      }
    : null

  const breadcrumbSchema = initialMatch
    ? {
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
            name: initialMatch.league.name,
            item: `https://myscore24.com/league/${initialMatch.league.id}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}`,
            item: `https://myscore24.com/match/${slug}`,
          },
        ],
      }
    : null

  return (
    <>
      {sportsEventSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <MatchDetailClient slug={slug} initialMatch={initialMatch} />
    </>
  )
}
