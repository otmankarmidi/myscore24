import { SocialProvider, ValidatedSocialEmbed, SocialEmbedData } from './types'

const ALLOWED_X_DOMAINS = ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']
const ALLOWED_YT_DOMAINS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']
const ALLOWED_IG_DOMAINS = ['instagram.com', 'www.instagram.com']
const ALLOWED_TT_DOMAINS = ['tiktok.com', 'www.tiktok.com']

/**
 * Validates a social media URL, extracts its identifier, and detects provider strictly from URL.
 * Never trusts client or JSON provider property.
 */
export function detectAndValidateSocialUrl(rawUrl: string): ValidatedSocialEmbed | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null

  const trimmed = rawUrl.trim()
  if (!trimmed.startsWith('https://')) {
    return null
  }

  // Reject malicious patterns, scripts, data, or iframes
  if (
    trimmed.includes('<') ||
    trimmed.includes('>') ||
    trimmed.toLowerCase().includes('javascript:') ||
    trimmed.toLowerCase().includes('data:')
  ) {
    return null
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const hostname = parsed.hostname.toLowerCase()
  const pathname = parsed.pathname

  // ─── 1. X / Twitter ────────────────────────────────────────────────────────
  if (ALLOWED_X_DOMAINS.includes(hostname)) {
    // Pattern: /<user>/status/<tweetId>
    const match = pathname.match(/^\/[a-zA-Z0-9_]{1,50}\/status\/(\d+)/i)
    if (match && match[1]) {
      const tweetId = match[1]
      return {
        version: 1,
        provider: 'x',
        id: tweetId,
        url: `https://x.com/i/status/${tweetId}`,
      }
    }
    // Pattern: /i/web/status/<tweetId> or /statuses/<tweetId>
    const altMatch = pathname.match(/\/(?:status|statuses)\/(\d+)/i)
    if (altMatch && altMatch[1]) {
      const tweetId = altMatch[1]
      return {
        version: 1,
        provider: 'x',
        id: tweetId,
        url: `https://x.com/i/status/${tweetId}`,
      }
    }
  }

  // ─── 2. YouTube ────────────────────────────────────────────────────────────
  if (ALLOWED_YT_DOMAINS.includes(hostname)) {
    let videoId: string | null = null
    let isShorts = false

    if (hostname === 'youtu.be') {
      const idMatch = pathname.match(/^\/([a-zA-Z0-9_-]{11})/i)
      if (idMatch) videoId = idMatch[1]
    } else if (pathname.startsWith('/shorts/')) {
      const shortsMatch = pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/i)
      if (shortsMatch) {
        videoId = shortsMatch[1]
        isShorts = true
      }
    } else if (pathname.startsWith('/watch')) {
      const v = parsed.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        videoId = v
      }
    } else if (pathname.startsWith('/embed/')) {
      const embedMatch = pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/i)
      if (embedMatch) videoId = embedMatch[1]
    }

    if (videoId) {
      return {
        version: 1,
        provider: 'youtube',
        id: videoId,
        isShorts,
        url: isShorts
          ? `https://www.youtube.com/shorts/${videoId}`
          : `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      }
    }
  }

  // ─── 3. Instagram ──────────────────────────────────────────────────────────
  if (ALLOWED_IG_DOMAINS.includes(hostname)) {
    // Pattern: /p/<shortcode>/ or /reel/<shortcode>/ or /reels/<shortcode>/
    const match = pathname.match(/^\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i)
    if (match && match[1]) {
      const shortcode = match[1]
      return {
        version: 1,
        provider: 'instagram',
        id: shortcode,
        url: `https://www.instagram.com/p/${shortcode}/`,
        embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      }
    }
  }

  // ─── 4. TikTok ─────────────────────────────────────────────────────────────
  if (ALLOWED_TT_DOMAINS.includes(hostname)) {
    // Canonical format: /@<user>/video/<videoId>
    // Strict pattern matching without open redirect resolution to prevent SSRF
    const match = pathname.match(/^\/@([a-zA-Z0-9_.-]+)\/video\/(\d+)/i)
    if (match && match[1] && match[2]) {
      const user = match[1]
      const videoId = match[2]
      return {
        version: 1,
        provider: 'tiktok',
        id: videoId,
        url: `https://www.tiktok.com/@${user}/video/${videoId}`,
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      }
    }
  }

  return null
}

/**
 * Parses a block of text into structured SocialEmbedData if it matches the socialEmbed directive.
 */
export function parseSocialEmbedBlock(block: string): ValidatedSocialEmbed | null {
  if (!block) return null
  const trimmed = block.trim()

  // Match :::socialEmbed ... ::: format
  if (trimmed.startsWith(':::socialEmbed') && trimmed.endsWith(':::')) {
    const rawJson = trimmed.slice(14, -3).trim()
    try {
      const parsed: SocialEmbedData = JSON.parse(rawJson)
      if (parsed.type === 'socialEmbed' && parsed.url) {
        return detectAndValidateSocialUrl(parsed.url)
      }
    } catch {
      return null
    }
  }

  // Fallback: If the block itself is raw JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.type === 'socialEmbed' && parsed.url) {
        return detectAndValidateSocialUrl(parsed.url)
      }
    } catch {
      return null
    }
  }

  return null
}

/**
 * Serializes validated social embed into the safe canonical CMS block format.
 */
export function formatSocialEmbedBlock(validated: ValidatedSocialEmbed): string {
  const data: SocialEmbedData = {
    version: 1,
    type: 'socialEmbed',
    provider: validated.provider,
    url: validated.url,
    id: validated.id,
    isShorts: validated.isShorts,
  }
  return `:::socialEmbed\n${JSON.stringify(data, null, 2)}\n:::`
}
