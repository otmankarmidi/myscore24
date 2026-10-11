'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'

interface HomeNewsMagazineProps {
  articles?: NewsArticle[]
}

/**
 * 1. Dominant Large Featured Story Card (Matching Image 1 & Image 2)
 */
function LargeHeroCard({ article }: { article: NewsArticle }) {
  const { locale } = useLanguage()
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  return (
    <article className="h-full">
      <Link
        href={`/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`}
        className="group relative flex flex-col justify-end rounded-2xl overflow-hidden border border-surface-bright/70 hover:border-primary/80 transition-all shadow-lg bg-surface-container h-full min-h-[340px] sm:min-h-[380px] md:min-h-[430px]"
      >
        {/* Background Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 750px"
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

        {/* Text Content Overlay */}
        <div className="relative p-4 sm:p-6 space-y-2.5 z-10 text-start">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-primary text-on-primary font-bold uppercase tracking-wider text-[11px] shadow-sm">
              {article.category || (locale === 'ar' ? 'كرة القدم' : 'Football')}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-300 font-medium text-xs">
              {formatDate(article.publishedAt, undefined, undefined, locale)}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug drop-shadow-sm">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 font-normal leading-relaxed opacity-95">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
              <span>{locale === 'ar' ? 'اقرأ المقال' : 'Read Article'}</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
            </span>
            <span className="flex items-center gap-1 opacity-80">
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              <span>0</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * 2. Medium 2x2 Hero Grid Card (Matching Image 1 & Image 2 Side Cards)
 */
function HeroGridCard({ article }: { article: NewsArticle }) {
  const { locale } = useLanguage()
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  return (
    <article className="flex flex-col h-full">
      <Link
        href={`/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`}
        className="group flex flex-col justify-between h-full rounded-xl border border-surface-bright/70 bg-surface-container hover:bg-surface-container-high hover:border-primary/60 transition-all p-2.5 sm:p-3 text-start shadow-sm"
      >
        <div className="space-y-2">
          {/* Card Image */}
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                loading="lazy"
                unoptimized
                sizes="(max-width: 768px) 100vw, 320px"
                onError={() => setImageError(true)}
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-3xl text-primary/30">newspaper</span>
              </div>
            )}
          </div>

          {/* Category Tag */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary">
            {article.category || (locale === 'ar' ? 'عاجل' : 'News')}
          </span>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
        </div>

        {/* Footer info: Date & Comments icon (Matching Image 1 & 2) */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 mt-2 border-t border-surface-bright/40">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            <span>{formatDate(article.publishedAt, undefined, undefined, locale)}</span>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <span className="material-symbols-outlined text-xs">chat_bubble</span>
            <span>0</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * 3. Standard 3-Column News Card (Matching Image 1 Grid)
 */
function StandardNewsCard({ article }: { article: NewsArticle }) {
  const { locale } = useLanguage()
  const normalizedUrl = normalizeArticleImageUrl(article.imageUrl || article.image)
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && normalizedUrl ? normalizedUrl : null

  return (
    <article className="flex flex-col h-full">
      <Link
        href={`/${article.language || 'en'}/news/${encodeURIComponent(article.slug)}`}
        className="group flex flex-col justify-between h-full rounded-xl border border-surface-bright/70 bg-surface-container hover:bg-surface-container-high hover:border-primary/60 overflow-hidden transition-all text-start shadow-sm"
      >
        <div>
          {/* Card Image */}
          <div className="relative w-full aspect-[16/9] bg-surface-container-highest overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                loading="lazy"
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                onError={() => setImageError(true)}
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-3xl text-primary/30">newspaper</span>
              </div>
            )}
          </div>

          <div className="p-3 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {article.category || (locale === 'ar' ? 'كرة القدم' : 'Football')}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </div>
        </div>

        <div className="px-3 pb-3 flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-bright/40">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            <span>{formatDate(article.publishedAt, undefined, undefined, locale)}</span>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <span className="material-symbols-outlined text-xs">chat_bubble</span>
            <span>0</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * 4. Breaking News Widget (Matching Image 1 Right Column: "أخبار عاجلة")
 */
function BreakingNewsWidget({ articles = [] }: { articles: NewsArticle[] }) {
  const { locale, t } = useLanguage()

  return (
    <aside
      className="bg-surface-container rounded-2xl border border-surface-bright/70 p-4 shadow-sm flex flex-col justify-between"
      aria-label="Breaking News"
    >
      <div className="space-y-3">
        {/* Header with red indicator */}
        <div className="flex items-center gap-2 border-b border-surface-bright/60 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-base font-bold font-geist text-white">
            {locale === 'ar' ? 'أخبار عاجلة' : locale === 'fr' ? 'Dernière Heure' : 'Breaking News'}
          </h3>
        </div>

        {/* List of Breaking Items with Separators */}
        <div className="divide-y divide-surface-bright/50">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/${art.language || 'en'}/news/${encodeURIComponent(art.slug)}`}
              className="group block py-2.5 first:pt-1 last:pb-1 text-start transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary mb-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                <span>{formatRelativeDate(art.publishedAt, locale)}</span>
              </div>
              <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {art.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* View All Button (Matching Image 1: "عرض المزيد") */}
      <div className="pt-3 mt-3 border-t border-surface-bright/60">
        <Link
          href={`/${locale === 'ar' ? 'ar' : 'en'}/news`}
          className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-surface-bright/70 text-center text-xs font-bold text-primary hover:text-white transition-all flex items-center justify-center gap-1"
        >
          <span>{locale === 'ar' ? 'عرض المزيد' : 'View More'}</span>
          <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>
    </aside>
  )
}

/**
 * Editorial News Magazine Component for Homepage
 * Perfectly matches Image 1 & Image 2 for maximum AdSense compliance & aesthetics!
 */
export default function HomeNewsMagazine({ articles = [] }: HomeNewsMagazineProps) {
  const { locale, t } = useLanguage()

  if (!articles || articles.length === 0) {
    return null
  }

  // 1. Hero Section Articles:
  // Featured story = articles[0]
  // Side 2x2 grid = articles.slice(1, 5)
  const featuredArticle = articles[0]
  const heroSideArticles = articles.slice(1, 5)

  // 2. Main Middle Section:
  // Main Grid = articles.slice(5, 11)
  // Breaking News Sidebar = articles.slice(0, 7)
  const mainGridArticles = articles.slice(5, 11)
  const breakingArticles = articles.slice(0, 7)

  // 3. Category Spotlight Section (Image 2 bottom row):
  // 4 cards in a row = articles.slice(2, 6) or articles.slice(7, 11)
  const categoryArticles = articles.length >= 8 ? articles.slice(6, 10) : articles.slice(1, 5)

  return (
    <div className="space-y-6 select-none" aria-label="Editorial Football News">
      {/* ── SECTION 1: HERO SHOWCASE (Matching Image 1 & 2 Top) ──────────────── */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Side 2x2 Grid (In RTL: Left side / Desktop lg:col-span-5, lg:order-1) */}
          {heroSideArticles.length > 0 && (
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 order-2 lg:order-1">
              {heroSideArticles.map((art) => (
                <HeroGridCard key={art.id} article={art} />
              ))}
            </div>
          )}

          {/* Large Dominant Featured Story (In RTL: Right side / Desktop lg:col-span-7, lg:order-2) */}
          <div
            className={`${
              heroSideArticles.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
            } order-1 lg:order-2`}
          >
            <LargeHeroCard article={featuredArticle} />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: GRID NEWS + BREAKING NEWS SIDEBAR (Matching Image 1 Middle) ─ */}
      <section className="space-y-3 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Main News Cards Grid (8 cols) */}
          <div
            className={`${
              breakingArticles.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'
            } order-2 lg:order-1`}
          >
            {mainGridArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 h-full">
                {mainGridArticles.map((art) => (
                  <StandardNewsCard key={art.id} article={art} />
                ))}
              </div>
            ) : (
              // Fallback to top articles if fewer than 5
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 h-full">
                {articles.slice(0, 3).map((art) => (
                  <StandardNewsCard key={art.id} article={art} />
                ))}
              </div>
            )}
          </div>

          {/* Breaking News Sidebar Widget (4 cols, Matching Image 1 "أخبار عاجلة") */}
          {breakingArticles.length > 0 && (
            <div className="lg:col-span-4 order-1 lg:order-2">
              <BreakingNewsWidget articles={breakingArticles} />
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3: CATEGORY SPOTLIGHT ROW (Matching Image 2 Bottom 4-Cards) ── */}
      {categoryArticles.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-surface-bright/50">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-primary" />
              <h3 className="text-base sm:text-lg font-bold font-geist text-on-surface">
                {locale === 'ar'
                  ? 'أخبار الدوري الإسباني والكرة العالمية'
                  : locale === 'fr'
                  ? 'Football International'
                  : 'World Football News'}
              </h3>
            </div>
            <Link
              href={`/${locale === 'ar' ? 'ar' : 'en'}/news`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>{locale === 'ar' ? 'جميع الأخبار' : 'All News'}</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {categoryArticles.map((art) => (
              <HeroGridCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
