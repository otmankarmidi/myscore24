import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
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
    const formattedSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      title: `${formattedSlug} - Football Competition | MyScore24`,
      description: `Follow ${formattedSlug} live football fixtures, match scores, standings, and statistics on MyScore24.`,
      alternates: {
        canonical: `https://myscore24.com/league/${slug}`,
      },
      robots: { index: false, follow: true },
    }
  }

  const compName = competition.name
  const countryName = competition.country?.name ? ` (${competition.country.name})` : ''
  const title = `${compName}${countryName} Fixtures, Results & Standings | MyScore24`
  const description = `Live scores, fixtures, results, standings table and top scorers for ${compName}${countryName}. Real-time football coverage and statistics on MyScore24.`
  const canonical = `https://myscore24.com/league/${slug}`

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

  const breadcrumbSchema = competition
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
            name: 'Competitions',
            item: 'https://myscore24.com/competitions',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: competition.name,
            item: `https://myscore24.com/league/${slug}`,
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
