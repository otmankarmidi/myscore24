import { NewsArticle } from '@/types/news'

export const mockNews: NewsArticle[] = []

export const getFeaturedNews = (): NewsArticle[] => []
export const getNewsBySlug = (_slug: string): NewsArticle | undefined => undefined
export const getNewsByCategory = (_category: string): NewsArticle[] => []
