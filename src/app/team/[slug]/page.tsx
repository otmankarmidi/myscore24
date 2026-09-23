import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import TeamClient from './TeamClient'

interface TeamPageProps {
  params: Promise<{ slug: string }>
}

async function getStoredTeam(slug: string) {
  try {
    const numericId = Number(slug)
    if (!isNaN(numericId) && numericId > 0) {
      const team = await prisma.team.findUnique({
        where: { providerId: numericId },
      })
      if (team) return team
    }

    const cleanName = slug.replace(/-/g, ' ').trim()
    if (cleanName) {
      const teamByName = await prisma.team.findFirst({
        where: {
          name: {
            contains: cleanName,
          },
        },
      })
      if (teamByName) return teamByName
    }

    return null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params
  const team = await getStoredTeam(slug)

  if (!team) {
    const formattedSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      title: `${formattedSlug} - Football Club | MyScore24`,
      description: `Follow ${formattedSlug} football fixtures, live scores, squad roster, and match statistics on MyScore24.`,
      alternates: {
        canonical: `https://myscore24.com/team/${slug}`,
      },
      robots: { index: false, follow: true },
    }
  }

  const teamName = team.name
  const countryName = team.country ? ` (${team.country})` : ''
  const title = `${teamName}${countryName} Fixtures, Results & Squad | MyScore24`
  const description = `Follow ${teamName}${countryName} live scores, recent match results, upcoming fixtures, squad roster and team stats on MyScore24.`
  const canonical = `https://myscore24.com/team/${slug}`

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
          url: team.logo || '/og-image.png',
          width: 1200,
          height: 630,
          alt: teamName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [team.logo || '/og-image.png'],
    },
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params
  const team = await getStoredTeam(slug)

  const sportsTeamSchema = team
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        name: team.name,
        logo: team.logo || undefined,
        sport: 'Football',
        location: team.country
          ? {
              '@type': 'Place',
              name: team.country,
            }
          : undefined,
      }
    : null

  const breadcrumbSchema = team
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
            name: 'Teams',
            item: 'https://myscore24.com/competitions',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: team.name,
            item: `https://myscore24.com/team/${slug}`,
          },
        ],
      }
    : null

  return (
    <>
      {sportsTeamSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <TeamClient slug={slug} />
    </>
  )
}
