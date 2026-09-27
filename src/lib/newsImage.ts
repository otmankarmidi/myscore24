/**
 * Single source of truth for normalizing, validating, and formatting
 * CMS Article Featured Images across the entire MyScore24 application.
 */

const CANONICAL_SITE_URL = 'https://www.myscore24.com'
const DEFAULT_FALLBACK_OG = 'https://www.myscore24.com/og-image.png'

/**
 * Normalizes an article image URL from MySQL/CMS into a valid web path or null.
 * 
 * Supports:
 * - valid local persistent paths (e.g. /uploads/news/...)
 * - valid absolute URLs (e.g. https://www.myscore24.com/uploads/...)
 * - missing, empty, or fallback placeholder URLs -> returns null
 */
export function normalizeArticleImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null
  }

  const trimmed = rawUrl.trim()
  if (!trimmed || trimmed === '/og-image.png' || trimmed === DEFAULT_FALLBACK_OG) {
    return null
  }

  // Already relative path
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  // Absolute URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's on our canonical domain, normalize to relative path for internal Next.js image loading
    try {
      const parsed = new URL(trimmed)
      if (parsed.hostname === 'www.myscore24.com' || parsed.hostname === 'myscore24.com') {
        return parsed.pathname + parsed.search
      }
    } catch {
      // not a valid URL
    }
    return trimmed
  }

  // Fallback: prepend slash if relative without leading slash
  return `/${trimmed}`
}

/**
 * Returns an absolute URL suitable for Open Graph, Twitter cards, and NewsArticle JSON-LD schema.
 * Guaranteed to return an absolute HTTPS URL (or the site's canonical og-image.png fallback).
 */
export function getArticleOgImageUrl(rawUrl?: string | null): string {
  const normalized = normalizeArticleImageUrl(rawUrl)
  if (!normalized) {
    return DEFAULT_FALLBACK_OG
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  return `${CANONICAL_SITE_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`
}

/**
 * Quick boolean check if the article has a customized, valid featured image.
 */
export function hasValidArticleImage(rawUrl?: string | null): boolean {
  return normalizeArticleImageUrl(rawUrl) !== null
}
