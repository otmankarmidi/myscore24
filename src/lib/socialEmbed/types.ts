/**
 * Social Media Embed Types
 * ────────────────────────
 * Versioned schema for social media embeds in MyScore24 News CMS.
 */

export type SocialProvider = 'x' | 'youtube' | 'instagram' | 'tiktok'

export interface SocialEmbedData {
  version: 1
  type: 'socialEmbed'
  provider: SocialProvider
  url: string
  id?: string
  isShorts?: boolean
}

export interface ValidatedSocialEmbed {
  version: 1
  provider: SocialProvider
  url: string
  id: string
  isShorts?: boolean
  embedUrl?: string
}

export interface ProviderMeta {
  provider: SocialProvider
  name: string
  domains: string[]
  icon: string
  brandColor: string
  aspectRatioClass: string
  defaultMinHeight: number
}
