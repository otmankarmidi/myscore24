export type Locale = 'en' | 'fr' | 'ar'
export type Theme = 'dark' | 'light'
export type Direction = 'ltr' | 'rtl'

export interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: Pagination
  error?: string
}
