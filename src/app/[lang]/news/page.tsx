import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NewsClient from '@/app/news/NewsClient'
import { getPublishedArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

interface LocalizedNewsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: LocalizedNewsPageProps): Promise<Metadata> {
  const { lang } = await params
  if (lang !== 'en' && lang !== 'ar') {
    return {
      title: 'Page Not Found | MyScore24',
      robots: { index: false, follow: false },
    }
  }

  const isAr = lang === 'ar'
  const title = isAr
    ? 'أخبار كرة القدم، سوق الانتقالات والتحليلات التكتيكية | MyScore24'
    : 'Football News, Transfer Rumours & Tactical Analysis | MyScore24'

  const description = isAr
    ? 'تابع أحدث وأبرز أخبار كرة القدم العاجلة، صفقات وانتقالات اللاعبين المؤكدة، تغطيات حصرية للمباريات وتحليلات تكتيكية معمقة عبر MyScore24.'
    : 'Stay updated with the latest breaking football news, confirmed transfer rumours, comprehensive match previews, and in-depth tactical analysis on MyScore24.'

  const canonical = `https://www.myscore24.com/${lang}/news`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: 'https://www.myscore24.com/en/news',
        ar: 'https://www.myscore24.com/ar/news',
        'x-default': 'https://www.myscore24.com/en/news',
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'MyScore24',
      locale: isAr ? 'ar_AR' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: isAr ? 'أخبار كرة القدم MyScore24' : 'MyScore24 Football News',
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

export default async function LocalizedNewsPage({ params }: LocalizedNewsPageProps) {
  const { lang } = await params
  if (lang !== 'en' && lang !== 'ar') {
    notFound()
  }

  const isAr = lang === 'ar'
  const articles = await getPublishedArticles(lang)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isAr ? 'الرئيسية' : 'Home',
        item: 'https://www.myscore24.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isAr ? 'الأخبار' : 'News',
        item: `https://www.myscore24.com/${lang}/news`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsClient initialArticles={articles} language={lang} />
    </>
  )
}
