'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { formatDate } from '@/lib/utils'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'

interface HomeLatestNewsProps {
  articles?: NewsArticle[]
}

function getAuthorName(author: NewsArticle['author']): string {
  if (typeof author === 'string') return author
  return author?.name || 'MyScore24 Desk'
}

/**
 * 1. Large Dominant Featured Story Card
 */
function FeaturedStoryCard({ article }: { article: NewsArticle }) {
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null
  const authorName = getAuthorName(article.author)

  return (
    <article className="h-full">
      <Link
        href={`/news/${article.slug}`}
        className="group relative flex flex-col justify-end rounded-xl overflow-hidden border border-surface-bright/70 hover:border-primary/70 transition-all shadow-md bg-surface-container h-full min-h-[300px] sm:min-h-[340px] md:min-h-[370px]"
      >
        {/* Background Image / Placeholder */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 650px"
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-bright to-surface-container-lowest flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary/30" aria-hidden="true">
              newspaper
            </span>
          </div>
        )}

        {/* Readability Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent pointer-events-none" />

        {/* Text Content Overlay */}
        <div className="relative p-4 sm:p-5 space-y-2 z-10 text-start">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold uppercase tracking-wider text-[10px]">
              {article.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-300 font-medium text-[11px]">{formatDate(article.publishedAt)}</span>
            {authorName && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-300 text-[11px] hidden sm:inline">{authorName}</span>
              </>
            )}
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 font-normal leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}

/**
 * 2. Left Column Stacked Small Card (Horizontal format on desktop)
 */
function LeftColumnNewsCard({ article }: { article: NewsArticle }) {
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  return (
    <article className="flex-1 flex">
      <Link
        href={`/news/${article.slug}`}
        className="group flex-1 flex gap-3 p-3 rounded-xl border border-surface-bright/70 bg-surface-container hover:bg-surface-container-high hover:border-primary/60 transition-all text-start"
      >
        <div className="relative w-24 sm:w-28 md:w-32 h-20 sm:h-22 md:h-full rounded-lg overflow-hidden bg-surface-container-highest shrink-0 min-h-[72px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 110px, 130px"
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-high">
              <span className="material-symbols-outlined text-2xl text-primary/30" aria-hidden="true">
                newspaper
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {article.category}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-on-surface-variant pt-1">
            <span className="material-symbols-outlined text-xs" aria-hidden="true">
              schedule
            </span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * 3. Bottom Row Compact/Horizontal Card
 */
function BottomRowNewsCard({ article }: { article: NewsArticle }) {
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  return (
    <article className="flex">
      <Link
        href={`/news/${article.slug}`}
        className="group flex-1 flex flex-col rounded-xl border border-surface-bright/70 bg-surface-container hover:bg-surface-container-high hover:border-primary/60 overflow-hidden transition-all text-start"
      >
        <div className="relative w-full aspect-[16/9] bg-surface-container-highest overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-high">
              <span className="material-symbols-outlined text-3xl text-primary/30" aria-hidden="true">
                newspaper
              </span>
            </div>
          )}
          <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/85 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider">
            {article.category}
          </span>
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
          <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant pt-1 border-t border-surface-bright/50">
            <span className="material-symbols-outlined text-xs" aria-hidden="true">
              schedule
            </span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * Editorial Latest News Grid Component for Homepage
 */
export default function HomeLatestNews({ articles = [] }: HomeLatestNewsProps) {
  const { t } = useLanguage()

  if (!articles || articles.length === 0) {
    return null
  }

  // 1. Featured story: dominant high-priority/latest article
  const featuredArticle = articles[0]

  // 2. Left column cards (up to 2 articles)
  const leftArticles = articles.slice(1, 3)

  // 3. Bottom row cards (up to 3 articles)
  const bottomArticles = articles.slice(3, 6)

  return (
    <section className="space-y-3 pb-3 border-b border-surface-bright/50" aria-label="Latest News">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">
            newspaper
          </span>
          <h2 className="text-base md:text-lg font-bold font-geist text-on-surface">
            {t('news.latestNews', 'Latest News')}
          </h2>
        </div>
        <Link
          href="/news"
          className="group flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-fixed transition-colors"
        >
          <span>{t('news.viewAll', 'View All News')}</span>
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Editorial Grid: Top Section (Left Stacked + Center Featured) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Mobile: Featured story appears first (order-1), Desktop: Left column (order-1 md:order-1) */}
        {leftArticles.length > 0 && (
          <div className="md:col-span-5 flex flex-col gap-3.5 order-2 md:order-1">
            {leftArticles.map((article) => (
              <LeftColumnNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Featured Story (Mobile: order-1, Desktop: order-2) */}
        <div className={`${leftArticles.length > 0 ? 'md:col-span-7' : 'md:col-span-12'} order-1 md:order-2`}>
          <FeaturedStoryCard article={featuredArticle} />
        </div>
      </div>

      {/* Editorial Grid: Bottom Row (3 compact/horizontal cards) */}
      {bottomArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
          {bottomArticles.map((article) => (
            <BottomRowNewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  )
}
