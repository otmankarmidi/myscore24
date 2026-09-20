export type NewsCategory = 'transfers' | 'match_report' | 'analysis' | 'breaking' | 'interviews' | 'tactics'

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  updatedAt?: string
  category: NewsCategory
  tags: string[]
  image?: string
  imageAlt?: string
  featured?: boolean
  readTime?: number
  relatedTeams?: string[]
  relatedLeagues?: string[]
}
