import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { mockTeams } from '@/data/mockTeams'
import TeamClient from './TeamClient'

export const dynamic = 'force-dynamic'

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
      // 1. Exact name match
      let teamByName = await prisma.team.findFirst({
        where: {
          name: { equals: cleanName },
        },
      })
      if (teamByName) return teamByName

      // 2. Club team starting with cleanName
      teamByName = await prisma.team.findFirst({
        where: {
          name: { startsWith: cleanName },
          national: false,
        },
      })
      if (teamByName) return teamByName

      // 3. Any club team containing cleanName
      teamByName = await prisma.team.findFirst({
        where: {
          name: { contains: cleanName },
          national: false,
        },
      })
      if (teamByName) return teamByName

      // 4. Fallback
      teamByName = await prisma.team.findFirst({
        where: {
          name: { contains: cleanName },
        },
      })
      if (teamByName) return teamByName
    }

    // 5. Mock / Curated fallback
    const normSlug = slug.toLowerCase().trim()
    const mock = mockTeams.find(
      (t) =>
        t.slug === normSlug ||
        t.id === normSlug ||
        (normSlug.includes('barcelona') && t.id === 'fcb') ||
        (normSlug.includes('madrid') && t.id === 'rma')
    )
    if (mock) {
      return {
        id: mock.id,
        providerId: Number(mock.id) || 529,
        name: mock.name,
        code: mock.abbreviation,
        country: mock.country,
        founded: mock.founded || null,
        national: false,
        logo: mock.logo || null,
        venueName: mock.stadium || null,
        venueCapacity: mock.stadiumCapacity || null,
      } as any
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
        canonical: `https://www.myscore24.com/team/${slug}`,
      },
      robots: { index: false, follow: true },
    }
  }

  const teamName = team.name
  const countryName = team.country ? ` (${team.country})` : ''
  const title = `${teamName}${countryName} Fixtures, Results & Squad | MyScore24`
  const description = `Follow ${teamName}${countryName} live scores, recent match results, upcoming fixtures, squad roster and team stats on MyScore24.`
  const canonical = `https://www.myscore24.com/team/${slug}`

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

  if (!team) {
    notFound()
  }

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
            item: 'https://www.myscore24.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Teams',
            item: 'https://www.myscore24.com/competitions',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: team.name,
            item: `https://www.myscore24.com/team/${slug}`,
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
