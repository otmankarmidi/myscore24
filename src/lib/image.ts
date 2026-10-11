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
    // Determine responsive target width (1.5x retina factor rounded to nearest safe step: 24, 32, 48, 64, 96, 128, 160, 256)
    const rawTarget = Math.round(width * 1.5)
    const steps = [24, 32, 48, 64, 96, 128, 160, 256]
    let targetWidth = steps[steps.length - 1]
    for (const s of steps) {
      if (rawTarget <= s) {
        targetWidth = s
        break
      }
    }
    return `/api/image?url=${encodeURIComponent(url)}&w=${targetWidth}`
  }

  return url
}
