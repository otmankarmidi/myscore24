import { permanentRedirect, notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/articles'

export const dynamic = 'force-dynamic'

interface LegacyArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function LegacyNewsArticlePage({ params }: LegacyArticlePageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const { article } = await getArticleBySlug(decodedSlug)

  if (!article) {
    notFound()
  }

  const targetLang = article.language || 'en'
  permanentRedirect(`/${targetLang}/news/${encodeURIComponent(article.slug)}`)
}
