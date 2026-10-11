export type NewsCategory =
  | 'transfers'
  | 'match_report'
  | 'analysis'
  | 'breaking'
  | 'interviews'
  | 'tactics'
  | 'premier league'
  | 'champions league'
  | string

export type ArticleLanguage = 'en' | 'ar' | 'fr'

export interface NewsAuthor {
  name: string
  avatar?: string
  role?: string
}

export interface ArticleTranslationRef {
  id: string
  slug: string
  language: string
  title: string
  status?: string
}

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: NewsAuthor | string
  publishedAt: string
  updatedAt?: string
  category: string
  categorySlug?: string
  tags: string[]
  keywords?: string[]
  image?: string
  imageUrl?: string
  imageAlt?: string
  featured?: boolean
  readTime?: number
  readTimeMinutes?: number
  relatedTeams?: string[]
  relatedLeagues?: string[]
  language?: string
  translationGroupId?: string | null
  translations?: ArticleTranslationRef[]
}
