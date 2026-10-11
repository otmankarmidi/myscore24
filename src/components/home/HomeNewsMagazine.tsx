'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'

interface HomeNewsMagazineProps {
  articles?: NewsArticle[]
}

/**
 * Moroccan 8-point geometric rosette star icon in amber/gold (Matching Image)
 */
function GoldenGeometricIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-amber-500 drop-shadow-sm"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        transform="rotate(45 12 12)"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  )
}

/**
 * Format timestamp badge exactly like screenshot: "أوروبا اليوم في 00:22" or "أوروبا الأمس في 23:32"
 */
function formatNewsBadge(dateString: string, categoryName?: string, locale: string = 'ar'): string {
  const date = new Date(dateString)
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'
  const cat = categoryName || (isAr ? 'أوروبا' : isFr ? 'Europe' : 'World')

  if (isNaN(date.getTime())) {
    return cat
  }

  const now = new Date()
  const timeStr = date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isAr) {
    if (isToday) return `${cat} اليوم في ${timeStr}`
    if (isYesterday) return `${cat} الأمس في ${timeStr}`
    return `${cat} ${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} في ${timeStr}`
  }

  if (isFr) {
    if (isToday) return `${cat} Aujourd'hui à ${timeStr}`
    if (isYesterday) return `${cat} Hier à ${timeStr}`
    return `${cat} ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${timeStr}`
  }

  if (isToday) return `${cat} Today at ${timeStr}`
  if (isYesterday) return `${cat} Yesterday at ${timeStr}`
  return `${cat} ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${timeStr}`
}

/**
 * Large Featured Hero Card (Matching Right Column in Screenshot)
 */
function LargeHeroStory({ article }: { article: NewsArticle }) {
  const { locale } = useLanguage()
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  const badgeText = formatNewsBadge(article.publishedAt, article.category, locale)

  return (
    <article className="h-full">
      <Link
        href={`/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`}
        className="group flex flex-col h-full text-start cursor-pointer"
      >
        {/* Large Image on Top with Rounded Corners */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 750px"
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-amber-500/30">newspaper</span>
            </div>
          )}
        </div>

        {/* Text Area Below Image */}
        <div className="pt-3 sm:pt-4 space-y-1.5">
          {/* Category & Time Badge in Amber (e.g. "أوروبا اليوم في 00:22") */}
          <div className="text-amber-500 font-bold text-xs sm:text-sm tracking-wide">
            {badgeText}
          </div>

          {/* Big Bold Headline in White */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h2>
        </div>
      </Link>
    </article>
  )
}

/**
 * Compact Horizontal News Item (Matching Left Column in Screenshot)
 */
function CompactNewsItem({ article }: { article: NewsArticle }) {
  const { locale } = useLanguage()
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  const badgeText = formatNewsBadge(article.publishedAt, article.category, locale)

  return (
    <article className="w-full">
      <Link
        href={`/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`}
        className="group flex items-center gap-3.5 sm:gap-4 text-start cursor-pointer transition-colors"
      >
        {/* In RTL: Text is on Right, Thumbnail on Left */}
        {locale === 'ar' ? (
          <>
            {/* Thumbnail on Far Left */}
            <div className="relative w-24 sm:w-28 md:w-32 h-18 sm:h-20 md:h-[84px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80 shrink-0 shadow-sm order-1">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  loading="lazy"
                  unoptimized
                  sizes="(max-width: 768px) 112px, 128px"
                  onError={() => setImageError(true)}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <span className="material-symbols-outlined text-2xl text-amber-500/40">newspaper</span>
                </div>
              )}
            </div>

            {/* Content on Right */}
            <div className="flex-1 min-w-0 space-y-1 order-2">
              <div className="text-amber-500 font-bold text-[11px] sm:text-xs tracking-wide">
                {badgeText}
              </div>
              <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
            </div>
          </>
        ) : (
          <>
            {/* In LTR: Thumbnail on Left, Content on Right */}
            <div className="relative w-24 sm:w-28 md:w-32 h-18 sm:h-20 md:h-[84px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80 shrink-0 shadow-sm">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  loading="lazy"
                  unoptimized
                  sizes="(max-width: 768px) 112px, 128px"
                  onError={() => setImageError(true)}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <span className="material-symbols-outlined text-2xl text-amber-500/40">newspaper</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-amber-500 font-bold text-[11px] sm:text-xs tracking-wide">
                {badgeText}
              </div>
              <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
            </div>
          </>
        )}
      </Link>
    </article>
  )
}

/**
 * Editorial News Magazine Showcase
 * Replicates the exact style and layout from the user's uploaded screenshot
 */
export default function HomeNewsMagazine({ articles = [] }: HomeNewsMagazineProps) {
  const { locale } = useLanguage()

  if (!articles || articles.length === 0) {
    return null
  }

  // Article 0: Dominant Featured Story on the Right (in RTL)
  const heroArticle = articles[0]

  // Articles 1-4: The 4 vertically stacked stories on the Left (in RTL)
  const stackedArticles = articles.slice(1, 5)

  return (
    <section className="w-full select-none space-y-6 pt-3" aria-label="Latest Football News">
      {/* Section Header: "آخر أخبار كرة القدم" + Golden Geometric Emblem */}
      <div className="flex items-center justify-end gap-2.5 pb-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {locale === 'ar'
            ? 'آخر أخبار كرة القدم'
            : locale === 'fr'
            ? 'Dernières actualités du football'
            : 'Latest Football News'}
        </h2>
        <GoldenGeometricIcon />
      </div>

      {/* Main 2-Column Grid (Matching Uploaded Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column in RTL / Desktop 5 cols: 4 Stacked News Items */}
        {stackedArticles.length > 0 && (
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 sm:gap-5 order-2 lg:order-1">
            {stackedArticles.map((art) => (
              <CompactNewsItem key={art.id} article={art} />
            ))}
          </div>
        )}

        {/* Right Column in RTL / Desktop 7 cols: Large Dominant Hero Story */}
        <div
          className={`${
            stackedArticles.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
          } order-1 lg:order-2`}
        >
          <LargeHeroStory article={heroArticle} />
        </div>
      </div>

      {/* Centered CTA Button: "المزيد من الأخبار ←" in Amber/Gold */}
      <div className="pt-4 text-center">
        <Link
          href={`/${locale === 'ar' ? 'ar' : 'en'}/news`}
          className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-black text-sm px-7 py-2.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>
            {locale === 'ar'
              ? 'المزيد من الأخبار'
              : locale === 'fr'
              ? "Plus d'actualités"
              : 'More News'}
          </span>
          <span className="material-symbols-outlined text-base rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>
    </section>
  )
}
