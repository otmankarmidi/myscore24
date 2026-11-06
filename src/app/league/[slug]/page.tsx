import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { APPROVED_COMPETITIONS } from '@/config/competitions'
import LeagueClient from './LeagueClient'

interface LeaguePageProps {
  params: Promise<{ slug: string }>
}

async function getStoredCompetition(slug: string) {
  try {
    const numericId = Number(slug)
    if (!isNaN(numericId) && numericId > 0) {
      const comp = await prisma.competition.findUnique({
        where: { providerId: numericId },
        include: { country: true },
      })
      if (comp) return comp
    }

    // Check slug against approved competitions config
    const approved = APPROVED_COMPETITIONS.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() || (c.aliases && c.aliases.some((a) => a.toLowerCase() === slug.toLowerCase()))
    )
    if (approved) {
      const comp = await prisma.competition.findUnique({
        where: { providerId: approved.id },
        include: { country: true },
      })
      if (comp) return comp

      // Return synthetic competition representation from config if not yet synchronized in DB
      return {
        id: `comp-${approved.id}`,
        providerId: approved.id,
        name: approved.name,
        type: 'LEAGUE',
        logo: approved.localLogo || '',
        country: { name: approved.country },
      } as any
    }

    const cleanName = slug.replace(/-/g, ' ').trim()
    if (cleanName) {
      const compByName = await prisma.competition.findFirst({
        where: {
          name: {
            contains: cleanName,
          },
        },
        include: { country: true },
      })
      if (compByName) return compByName
    }

    return null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  const { slug } = await params
  const competition = await getStoredCompetition(slug)

  if (!competition) {
    return {
      title: 'Competition Not Found | MyScore24',
      description: 'The requested football competition or league could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const compName = competition.name
  const countryName = competition.country?.name ? ` (${competition.country.name})` : ''
  const title = `${compName}${countryName} Fixtures, Results & Standings | MyScore24`
  const description = `Live scores, fixtures, results, standings table and top scorers for ${compName}${countryName}. Real-time football coverage and statistics on MyScore24.`
  const canonical = `https://www.myscore24.com/league/${slug}`

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
          url: competition.logo || '/og-image.png',
          width: 1200,
          height: 630,
          alt: compName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [competition.logo || '/og-image.png'],
    },
  }
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { slug } = await params
  const competition = await getStoredCompetition(slug)

  if (!competition) {
    notFound()
  }

  const breadcrumbSchema = competition
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
            name: 'Competitions',
            item: 'https://www.myscore24.com/competitions',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: competition.name,
            item: `https://www.myscore24.com/league/${slug}`,
          },
        ],
      }
    : null

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <LeagueClient slug={slug} />
    </>
  )
}
