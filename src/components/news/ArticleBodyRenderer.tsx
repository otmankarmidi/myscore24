import React from 'react'
import Image from 'next/image'
import SocialEmbed from '@/components/social/SocialEmbed'
import { parseSocialEmbedBlock, detectAndValidateSocialUrl } from '@/lib/socialEmbed/validate'

interface ArticleBodyRendererProps {
  content: string
}

/**
 * Server-rendered Article Body Renderer
 * ─────────────────────────────────────
 * Renders headings, paragraphs, lists, quotes, and images as pure Server Component HTML.
 * Only social embeds are mounted as dynamic Client Component islands.
 */
export default function ArticleBodyRenderer({ content }: ArticleBodyRendererProps) {
  if (!content) return null

  // Split by double newline to identify separate blocks
  const blocks = content.split(/\n\s*\n/)

  return (
    <div className="space-y-4 text-body-md leading-relaxed text-on-surface/90 font-inter">
      {blocks.map((block, idx) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        // ── 1. Check for Social Embed Directive Block ────────────────────────
        const embed = parseSocialEmbedBlock(trimmed)
        if (embed) {
          return <SocialEmbed key={`embed-${idx}`} url={embed.url} />
        }

        // Check if single line is a raw supported social URL
        if (trimmed.startsWith('https://') && !trimmed.includes('\n') && !trimmed.includes(' ')) {
          const rawUrlEmbed = detectAndValidateSocialUrl(trimmed)
          if (rawUrlEmbed) {
            return <SocialEmbed key={`embed-${idx}`} url={rawUrlEmbed.url} />
          }
        }

        // ── 2. Markdown Headings ─────────────────────────────────────────────
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold text-on-surface pt-4 pb-1 border-b border-surface-bright">
              {trimmed.replace(/^##\s+/, '')}
            </h2>
          )
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-on-surface pt-2">
              {trimmed.replace(/^###\s+/, '')}
            </h3>
          )
        }

        // ── 3. Blockquotes ───────────────────────────────────────────────────
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '')
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-primary pl-4 py-2 italic text-on-surface font-medium bg-surface-container/60 rounded-r my-4"
            >
              &ldquo;{quoteText}&rdquo;
            </blockquote>
          )
        }

        // ── 4. Inline Markdown Images: ![alt](url) ───────────────────────────
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imgMatch) {
          const [, alt, src] = imgMatch
          return (
            <div key={idx} className="my-6 rounded-xl overflow-hidden border border-surface-bright bg-surface-container">
              <div className="relative aspect-[16/9] w-full">
                <Image src={src} alt={alt || 'Article photo'} fill unoptimized className="object-cover" />
              </div>
              {alt && <p className="p-2 text-center text-xs text-on-surface-variant italic">{alt}</p>}
            </div>
          )
        }

        // ── 5. Unordered Lists ───────────────────────────────────────────────
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-on-surface/90">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{item.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          )
        }

        // ── 6. Regular Paragraph ─────────────────────────────────────────────
        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}
