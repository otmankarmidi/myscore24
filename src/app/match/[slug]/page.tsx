import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  getStoredMatchByFixtureId,
  getStoredMatchBySlug,
  getStoredMatchH2H,
  getTeamRecentMatches,
  getRelatedArticlesForMatch,
} from '@/lib/football/persistence/queries'
import {
  buildMatchSlug,
  extractFixtureId,
  buildMatchSeoTitle,
  buildMatchMetaDescription,
} from '@/lib/football/matchUrl'
import MatchDetailClient from './MatchDetailClient'

export const dynamic = 'force-dynamic'

interface MatchPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { slug } = await params
  const fixtureId = extractFixtureId(slug)

  // Database-only lookup — NEVER call external APIs during metadata generation or crawling
  const match = fixtureId
    ? await getStoredMatchByFixtureId(fixtureId)
    : await getStoredMatchBySlug(slug)

  if (!match) {
    return {
      title: 'Match Details | MyScore24',
      description: 'Live scores, football stats, lineups, and head-to-head match details on MyScore24.',
      alternates: {
        canonical: `https://www.myscore24.com/match/${slug}`,
      },
      robots: { index: false, follow: true },
    }
  }

  const canonicalSlug = buildMatchSlug(match.homeTeam.name, match.awayTeam.name, match.id)
  const canonicalUrl = `https://www.myscore24.com/match/${canonicalSlug}`

  const title = buildMatchSeoTitle(match, 'en')
  const description = buildMatchMetaDescription(match, 'en')

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MyScore24',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
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

  // Database-only lookup for initial SSR hydration — 0 external API calls
  const initialMatch = fixtureId
    ? await getStoredMatchByFixtureId(fixtureId)
    : await getStoredMatchBySlug(slug)

  if (!initialMatch) {
    notFound()
  }

  // 1. Permanent 308 redirect from legacy /match/1234567 or non-canonical slugs to canonical SEO URL
  const canonicalSlug = buildMatchSlug(
    initialMatch.homeTeam.name,
    initialMatch.awayTeam.name,
    initialMatch.id
  )
  if (slug.toLowerCase() !== canonicalSlug.toLowerCase()) {
    permanentRedirect(`/match/${canonicalSlug}`)
  }

  // 2. Server-render all contextual data directly from MySQL (0 API calls)
  const [h2hMatches, homeRecent, awayRecent, relatedNews] = await Promise.all([
    initialMatch.homeTeam?.id && initialMatch.awayTeam?.id
      ? getStoredMatchH2H(
          initialMatch.homeTeam.id,
          initialMatch.awayTeam.id,
          Number(initialMatch.id),
          5
        )
      : Promise.resolve([]),
    initialMatch.homeTeam?.id
      ? getTeamRecentMatches(initialMatch.homeTeam.id, Number(initialMatch.id), 5)
      : Promise.resolve([]),
    initialMatch.awayTeam?.id
      ? getTeamRecentMatches(initialMatch.awayTeam.id, Number(initialMatch.id), 5)
      : Promise.resolve([]),
    getRelatedArticlesForMatch({
      fixtureId: Number(initialMatch.id),
      homeTeamName: initialMatch.homeTeam.name,
      awayTeamName: initialMatch.awayTeam.name,
      homeTeamId: initialMatch.homeTeam.id,
      awayTeamId: initialMatch.awayTeam.id,
      competitionId: initialMatch.league.id,
      limit: 3,
    }),
  ])

  // 3. Schema.org SportsEvent structured data
  const kickoffDate = initialMatch.kickoff ? new Date(initialMatch.kickoff) : new Date()
  const endDate = new Date(kickoffDate.getTime() + 105 * 60 * 1000).toISOString()
  const canonicalMatchUrl = `https://www.myscore24.com/match/${canonicalSlug}`

  const eventStatusMapping: Record<string, string> = {
    scheduled: 'https://schema.org/EventScheduled',
    live: 'https://schema.org/EventLive',
    half_time: 'https://schema.org/EventLive',
    extra_time: 'https://schema.org/EventLive',
    penalties: 'https://schema.org/EventLive',
    postponed: 'https://schema.org/EventPostponed',
    cancelled: 'https://schema.org/EventCancelled',
    full_time: 'https://schema.org/EventFinished',
  }
  const eventStatus = initialMatch.isFinal
    ? 'https://schema.org/EventFinished'
    : eventStatusMapping[initialMatch.status] || 'https://schema.org/EventScheduled'

  const sportsEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}`,
    description: `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name} in ${initialMatch.league.name}. Kickoff date, time, venue, team form and live coverage.`,
    startDate: initialMatch.kickoff || kickoffDate.toISOString(),
    endDate: endDate,
    eventStatus: eventStatus,
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    sport: 'Soccer',
    url: canonicalMatchUrl,
    image: [
      initialMatch.homeTeam.logo || 'https://www.myscore24.com/og-image.png',
      initialMatch.awayTeam.logo || 'https://www.myscore24.com/og-image.png',
    ].filter(Boolean),
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
    competitor: [
      {
        '@type': 'SportsTeam',
        name: initialMatch.homeTeam.name,
        logo: initialMatch.homeTeam.logo || undefined,
      },
      {
        '@type': 'SportsTeam',
        name: initialMatch.awayTeam.name,
        logo: initialMatch.awayTeam.logo || undefined,
      },
    ],
    location: {
      '@type': 'Place',
      name: initialMatch.venue || `${initialMatch.homeTeam.name} Stadium`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: initialMatch.league.country || 'Global',
      },
    },
    organizer: {
      '@type': 'SportsOrganization',
      name: initialMatch.league.name,
      url: `https://www.myscore24.com/league/${initialMatch.league.slug || 'league'}`,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalMatchUrl,
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: initialMatch.kickoff || kickoffDate.toISOString(),
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
        name: initialMatch.league.name,
        item: `https://www.myscore24.com/league/${initialMatch.league.id || initialMatch.league.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}`,
        item: canonicalMatchUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MatchDetailClient
        slug={canonicalSlug}
        initialMatch={initialMatch}
        initialH2h={h2hMatches}
        initialHomeRecent={homeRecent}
        initialAwayRecent={awayRecent}
        initialRelatedNews={relatedNews}
      />
    </>
  )
}
