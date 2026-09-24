'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import NewsCard from '@/components/news/NewsCard'
import { formatDate } from '@/lib/utils'
import { NewsArticle } from '@/types/news'
import { trackArticleOpen } from '@/lib/analytics'

interface LinkedEntity {
  competition?: { id: string; name: string; logo: string | null } | null
  team?: { id: string; name: string; logo: string | null } | null
  playerId?: string | null
  matchId?: string | null
}

interface NewsArticleClientProps {
  article: NewsArticle
  relatedNews: NewsArticle[]
  linkedEntity?: LinkedEntity
}

// Simple, secure parser for article markdown blocks
function ArticleBodyRenderer({ content }: { content: string }) {
  if (!content) return null

  // Split by double newline to form blocks
  const blocks = content.split(/\n\s*\n/)

  return (
    <div className="space-y-4 text-body-md leading-relaxed text-on-surface/90 font-inter">
      {blocks.map((block, idx) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        // H2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold text-on-surface pt-4 pb-1 border-b border-surface-bright">
              {trimmed.replace(/^##\s+/, '')}
            </h2>
          )
        }

        // H3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-on-surface pt-2">
              {trimmed.replace(/^###\s+/, '')}
            </h3>
          )
        }

        // Blockquote
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

        // Image: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imgMatch) {
          const [, alt, src] = imgMatch
          return (
            <div key={idx} className="my-6 rounded-xl overflow-hidden border border-surface-bright bg-surface-container">
              <div className="relative aspect-[16/9] w-full">
                <Image src={src} alt={alt || 'Article photo'} fill className="object-cover" />
              </div>
              {alt && <p className="p-2 text-center text-xs text-on-surface-variant italic">{alt}</p>}
            </div>
          )
        }

        // Unordered list
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

        // Regular paragraph (basic inline bold & italic replacement)
        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

export default function NewsArticleClient({
  article,
  relatedNews,
  linkedEntity,
}: NewsArticleClientProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (article) {
      trackArticleOpen({
        articleId: article.id || article.slug,
        articleTitle: article.title,
        category: article.category,
      })
    }
  }, [article])

  const authorName =
    typeof article.author === 'string'
      ? article.author
      : article.author?.name || 'MyScore24 Desk'
  const authorAvatar = typeof article.author === 'string' ? undefined : article.author?.avatar
  const authorRole =
    typeof article.author === 'string'
      ? 'Senior Football Analyst'
      : article.author?.role || 'Sports Desk'
  const imageUrl = article.imageUrl || article.image

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://myscore24.com/news/${article.slug}`

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    article.title
  )}&url=${encodeURIComponent(currentUrl)}`

  const shareFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`

  const shareWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${article.title} - ${currentUrl}`
  )}`

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Article Header info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold uppercase tracking-wider text-[10px]">
                {article.category}
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{formatDate(article.publishedAt)}</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">
                {article.readTimeMinutes || article.readTime || 3} min read
              </span>
            </div>

            <h1 className="text-headline-xl md:text-headline-xl text-on-surface font-extrabold leading-tight">
              {article.title}
            </h1>

            <p className="text-body-md text-on-surface-variant font-medium leading-relaxed">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-surface-bright flex-wrap">
              {/* Author Byline */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                  {authorAvatar ? (
                    <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-on-surface-variant">
                      {authorName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-body-sm font-bold text-on-surface">{authorName}</p>
                  <p className="text-[11px] text-on-surface-variant">{authorRole}</p>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold hidden sm:inline">
                  Share:
                </span>
                <a
                  href={shareTwitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-bright text-xs transition-colors"
                  title="Share on X / Twitter"
                >
                  <span className="font-bold">𝕏</span>
                </a>
                <a
                  href={shareFacebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-bright text-xs transition-colors"
                  title="Share on Facebook"
                >
                  <span className="font-bold text-blue-500">f</span>
                </a>
                <a
                  href={shareWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-bright text-xs transition-colors"
                  title="Share on WhatsApp"
                >
                  <span className="material-symbols-outlined text-sm text-[#4ae176]">chat</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-bright text-xs transition-colors flex items-center gap-1"
                  title="Copy article link"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copied ? 'check' : 'link'}
                  </span>
                  <span className="text-[11px] hidden md:inline">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface-container-high border border-surface-bright">
            {imageUrl ? (
              <Image src={imageUrl} alt={article.title} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl">feed</span>
              </div>
            )}
          </div>

          {/* Linked Football Entity Card (if associated) */}
          {linkedEntity && (linkedEntity.competition || linkedEntity.team || linkedEntity.playerId || linkedEntity.matchId) && (
            <div className="bg-surface-container rounded-xl border border-surface-bright p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Related Coverage
                  </p>
                  <p className="text-xs font-bold text-on-surface">
                    {linkedEntity.competition && `Competition: ${linkedEntity.competition.name}`}
                    {linkedEntity.team && `Team: ${linkedEntity.team.name}`}
                    {linkedEntity.playerId && `Player: ${linkedEntity.playerId}`}
                    {linkedEntity.matchId && `Match Fixture #${linkedEntity.matchId}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {linkedEntity.competition && (
                  <Link
                    href={`/league/${linkedEntity.competition.id}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-bright text-xs font-semibold text-primary hover:bg-surface-container-highest transition-colors"
                  >
                    View Standings &rarr;
                  </Link>
                )}
                {linkedEntity.team && (
                  <Link
                    href={`/team/${linkedEntity.team.id}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-bright text-xs font-semibold text-primary hover:bg-surface-container-highest transition-colors"
                  >
                    View Team Hub &rarr;
                  </Link>
                )}
                {linkedEntity.matchId && (
                  <Link
                    href={`/match/${linkedEntity.matchId}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-bright text-xs font-semibold text-primary hover:bg-surface-container-highest transition-colors"
                  >
                    View Match Centre &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Article Main Body */}
          <article className="prose prose-invert max-w-none">
            <ArticleBodyRenderer content={article.content} />
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-surface-bright flex items-center gap-2 flex-wrap">
              <span className="text-xs text-on-surface-variant font-medium">Tags:</span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-surface-container border border-surface-bright text-xs text-primary font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div className="pt-6 border-t border-surface-bright space-y-4">
              <h2 className="font-bold text-body-md text-on-surface uppercase tracking-wider">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedNews.map((rel) => (
                  <NewsCard key={rel.id} article={rel} variant="standard" />
                ))}
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
