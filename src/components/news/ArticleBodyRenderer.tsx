import React from 'react'
import Image from 'next/image'
import SocialEmbed from '@/components/social/SocialEmbed'
import { parseSocialEmbedBlock, detectAndValidateSocialUrl } from '@/lib/socialEmbed/validate'

interface ArticleBodyRendererProps {
  content: string
}

function parseInlineMarkdown(text: string): string {
  // Convert markdown bold **text** to <strong>text</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Convert markdown italic *text* to <em>$1</em>
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  // Convert markdown link [text](url) to <a href="url" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>
  html = html.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
  return html
}

function stripOuterTag(html: string, tag: string): string {
  const openRegex = new RegExp(`^<${tag}[^>]*>`, 'i')
  const closeRegex = new RegExp(`<\/${tag}>$`, 'i')
  return html.replace(openRegex, '').replace(closeRegex, '').trim()
}

/**
 * Server-rendered Article Body Renderer
 * ─────────────────────────────────────
 * Renders headings, paragraphs, lists, quotes, and images as pure Server Component HTML.
 * Supports both Markdown and standard HTML tags (<p>, <h2>, <h3>, <blockquote>, <strong>).
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

        // ── 2. Headings (Markdown & HTML) ────────────────────────────────────
        if (trimmed.startsWith('## ') || /^<h2[^>]*>/i.test(trimmed)) {
          const headingText = trimmed.startsWith('## ')
            ? trimmed.replace(/^##\s+/, '')
            : stripOuterTag(trimmed, 'h2')
          return (
            <h2
              key={idx}
              className="text-xl font-bold text-on-surface pt-4 pb-1 border-b border-surface-bright"
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(headingText) }}
            />
          )
        }

        if (trimmed.startsWith('### ') || /^<h3[^>]*>/i.test(trimmed)) {
          const headingText = trimmed.startsWith('### ')
            ? trimmed.replace(/^###\s+/, '')
            : stripOuterTag(trimmed, 'h3')
          return (
            <h3
              key={idx}
              className="text-lg font-bold text-on-surface pt-2"
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(headingText) }}
            />
          )
        }

        // ── 3. Blockquotes (Markdown & HTML) ─────────────────────────────────
        if (trimmed.startsWith('>') || /^<blockquote[^>]*>/i.test(trimmed)) {
          const quoteText = trimmed.startsWith('>')
            ? trimmed.replace(/^>\s*/gm, '')
            : stripOuterTag(trimmed, 'blockquote')
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-primary pl-4 py-2 italic text-on-surface font-medium bg-surface-container/60 rounded-r my-4"
              dangerouslySetInnerHTML={{ __html: `&ldquo;${parseInlineMarkdown(quoteText)}&rdquo;` }}
            />
          )
        }

        // ── 4. Inline Markdown Images: ![alt](url) ───────────────────────────
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imgMatch) {
          const [, alt, src] = imgMatch
          return (
            <div key={idx} className="my-6 rounded-xl overflow-hidden border border-surface-bright bg-surface-container">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={src}
                  alt={alt || 'Article photo'}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
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
                <li
                  key={itemIdx}
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.replace(/^[-*]\s+/, '')) }}
                />
              ))}
            </ul>
          )
        }

        // ── 6. Paragraphs (HTML <p>...</p> or Plain Text / Markdown) ─────────
        const paragraphText = /^<p[^>]*>/i.test(trimmed)
          ? stripOuterTag(trimmed, 'p')
          : trimmed

        return (
          <p
            key={idx}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(paragraphText) }}
          />
        )
      })}
    </div>
  )
}
