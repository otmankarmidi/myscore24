import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sportsService } from '@/services/sports/sportsService'
import PlayerClient from './PlayerClient'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const player = await sportsService.getPlayerBySlug(slug)

  if (!player) {
    return {
      title: 'Player Not Found | MyScore24',
      description: 'The requested football player profile could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const playerName = player.name
  const teamText = player.teamName ? ` - ${player.teamName}` : ''
  const title = `${playerName}${teamText} Stats, Profile & Career | MyScore24`
  const description = `View ${playerName}'s football profile${player.teamName ? ` at ${player.teamName}` : ''}. Match appearances, goals, assists, position details and career stats on MyScore24.`
  const canonical = `https://myscore24.com/player/${slug}`

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
      type: 'profile',
      siteName: 'MyScore24',
      images: [
        {
          url: player.photo || player.image || '/og-image.png',
          width: 800,
          height: 800,
          alt: playerName,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [player.photo || player.image || '/og-image.png'],
    },
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const player = await sportsService.getPlayerBySlug(slug)

  if (!player) {
    notFound()
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    jobTitle: player.position,
    image: player.photo || player.image || undefined,
    nationality: player.nationality || undefined,
    worksFor: player.teamName
      ? {
          '@type': 'SportsTeam',
          name: player.teamName,
        }
      : undefined,
  }

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
        name: player.teamName || 'Teams',
        item: player.teamSlug ? `https://myscore24.com/team/${player.teamSlug}` : 'https://myscore24.com',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: player.name,
        item: `https://myscore24.com/player/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PlayerClient player={player} />
    </>
  )
}
