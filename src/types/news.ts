export type NewsCategory = 'transfers' | 'match_report' | 'analysis' | 'breaking' | 'interviews' | 'tactics' | 'premier league' | 'champions league'

export interface NewsAuthor {
  name: string
  avatar?: string
  role?: string
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
  tags: string[]
  image?: string
  imageUrl?: string
  imageAlt?: string
  featured?: boolean
  readTime?: number
  readTimeMinutes?: number
  relatedTeams?: string[]
  relatedLeagues?: string[]
}
