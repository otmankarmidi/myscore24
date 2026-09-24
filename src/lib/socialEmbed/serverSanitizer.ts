import { detectAndValidateSocialUrl, formatSocialEmbedBlock } from './validate'
import { SocialEmbedData } from './types'

export interface SanitizeContentResult {
  valid: boolean
  sanitizedContent: string
  error?: string
}

/**
 * Validates and sanitizes article content on the server before saving to MySQL.
 * Strictly prevents XSS, arbitrary scripts, raw iframes, and validates all social embeds.
 */
export function sanitizeArticleContent(rawContent: string): SanitizeContentResult {
  if (!rawContent || typeof rawContent !== 'string') {
    return { valid: true, sanitizedContent: '' }
  }

  const lower = rawContent.toLowerCase()

  // 1. Explicitly reject executable HTML and dangerous attributes
  if (lower.includes('<script')) {
    return { valid: false, sanitizedContent: '', error: 'Security violation: Executable <script> tags are not permitted.' }
  }
  if (lower.includes('<iframe')) {
    return { valid: false, sanitizedContent: '', error: 'Security violation: Raw <iframe> tags are not permitted. Use the official Social Embed block.' }
  }
  if (lower.includes('javascript:') || lower.includes('vbscript:') || lower.includes('data:text/html')) {
    return { valid: false, sanitizedContent: '', error: 'Security violation: Script URL schemes are not permitted.' }
  }
  if (lower.includes('onerror=') || lower.includes('onload=') || lower.includes('onclick=')) {
    return { valid: false, sanitizedContent: '', error: 'Security violation: Inline HTML event handlers are not permitted.' }
  }

  // 2. Validate and re-normalize any social embed blocks
  const blocks = rawContent.split(/\n\s*\n/)
  const sanitizedBlocks: string[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    if (trimmed.startsWith(':::socialEmbed') && trimmed.endsWith(':::')) {
      const jsonStr = trimmed.slice(14, -3).trim()
      try {
        const parsed: SocialEmbedData = JSON.parse(jsonStr)
        if (!parsed.url) {
          return { valid: false, sanitizedContent: '', error: 'Social embed block is missing URL.' }
        }

        // Re-detect and validate provider strictly from URL
        const validated = detectAndValidateSocialUrl(parsed.url)
        if (!validated) {
          return {
            valid: false,
            sanitizedContent: '',
            error: `Invalid or unsupported social embed URL: "${parsed.url}". Only official URLs from x.com, youtube.com, instagram.com, and tiktok.com are allowed.`,
          }
        }

        // Store canonical structured format with version 1
        sanitizedBlocks.push(formatSocialEmbedBlock(validated))
      } catch {
        return { valid: false, sanitizedContent: '', error: 'Malformed social embed JSON block.' }
      }
    } else {
      sanitizedBlocks.push(trimmed)
    }
  }

  return {
    valid: true,
    sanitizedContent: sanitizedBlocks.join('\n\n'),
  }
}
