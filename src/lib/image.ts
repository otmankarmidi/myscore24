/**
 * Returns an optimized image URL via the first-party /api/image proxy
 * for remote football badges (API-Sports, etc.).
 *
 * For local SVGs or relative paths, returns the original path unchanged.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number = 48
): string {
  if (!url) return ''

  // If already relative, data URL, or SVG, don't proxy
  if (
    url.startsWith('/') ||
    url.startsWith('data:') ||
    url.endsWith('.svg')
  ) {
    return url
  }

  // Proxy remote API-Sports or external HTTP(S) logos
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Determine retina size (2x requested display size capped at 256 for player photos / badges)
    const targetWidth = Math.min(Math.max(width * 2, 24), 256)
    return `/api/image?url=${encodeURIComponent(url)}&w=${targetWidth}`
  }

  return url
}
