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

const TOP_STORIES_TAGS = [
  { id: 'all', label: 'All', labelAr: 'الكل' },
  { id: 'transfers', label: 'Transfers', labelAr: 'الانتقالات' },
  { id: 'premier-league', label: 'Premier League', labelAr: 'الدوري الإنجليزي' },
  { id: 'la-liga', label: 'LaLiga', labelAr: 'الدوري الإسباني' },
  { id: 'serie-a', label: 'Serie A', labelAr: 'الدوري الإيطالي' },
  { id: 'bundesliga', label: 'Bundesliga', labelAr: 'الدوري الألماني' },
  { id: 'ligue-1', label: 'Ligue 1', labelAr: 'الدوري الفرنسي' },
  { id: 'international', label: 'International', labelAr: 'دولي' },
]

function formatTimeAgo(dateString?: string, locale: string = 'en') {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'
  const isAr = locale === 'ar'

  const timeStr = date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const now = new Date()
  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isYesterday) {
    return isAr ? `أمس في ${timeStr}` : `Yesterday at ${timeStr}`
  }

  return isAr
    ? `${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} في ${timeStr}`
    : `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${timeStr}`
}

export default function HomeNewsMagazine({ articles = [] }: HomeNewsMagazineProps) {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'
  const [activeTag, setActiveTag] = useState<string>('all')

  if (!articles || articles.length === 0) {
    return null
  }

  // Hero article (index 0)
  const heroArticle = articles[0]
  const heroImage =
    normalizeArticleImageUrl(heroArticle.imageUrl || heroArticle.image) ||
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80'

  // Latest news list (next 4 articles)
  const latestArticles = articles.slice(1, 5)

  // Top Stories row (next 3 articles)
  const topStories = articles.slice(5, 8).length > 0 ? articles.slice(5, 8) : articles.slice(0, 3)

  // Trending widget article
  const trendingArticle = articles.length > 8 ? articles[8] : articles[0]

  return (
    <section className="w-full space-y-6 select-none" aria-label="Hero Editorial and Latest News">
      {/* ── TOP SECTION: Hero Story (Left) + Latest News Sidebar (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Dominant Hero Card (8 cols) matching Reference Image */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="group relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/20 dark:border-slate-800 shadow-xl flex flex-col justify-end p-6 sm:p-8 md:p-10">
            {/* Background Hero Image */}
            <Image
              src={heroImage}
              alt={heroArticle.title}
              fill
              priority
              unoptimized
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />

            {/* Cinematic dark gradients matching reference */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-2xl space-y-3">
              {/* Category pill & Timestamp */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <span>{heroArticle.category || 'ANALYSIS'}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 font-medium lowercase first-letter:uppercase">
                  {formatTimeAgo(heroArticle.publishedAt, locale)}
                </span>
              </div>

              {/* Big Bold Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-sm group-hover:text-amber-300 transition-colors">
                <Link href={`/${heroArticle.language || 'en'}/news/${encodeURIComponent(heroArticle.slug)}`}>
                  {heroArticle.title}
                </Link>
              </h1>

              {/* Excerpt / Summary */}
              {heroArticle.excerpt && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {heroArticle.excerpt}
                </p>
              )}

              {/* Bottom Controls Row: Amber CTA Button + Carousel Nav Dots & Chevrons */}
              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <Link
                  href={`/${heroArticle.language || 'en'}/news/${encodeURIComponent(heroArticle.slug)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'اقرأ المقال كاملاً' : 'Read Full Story'}</span>
                  <span className="material-symbols-outlined text-base rtl:rotate-180">arrow_forward</span>
                </Link>

                {/* Left/Right Round Chevrons + Progress Bars matching image */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous story"
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Next story"
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
                    </button>
                  </div>
                  {/* Active / Inactive Progress Pill Bars */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-1 rounded-full bg-amber-400" />
                    <span className="w-5 h-1 rounded-full bg-white/30" />
                    <span className="w-5 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest News Sidebar Card (4 cols) matching Reference Image */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="h-full rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#182335] shadow-lg p-5 flex flex-col justify-between">
            {/* Header: "Latest News" on left, "View All News ->" on right */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isAr ? 'آخر الأخبار' : 'Latest News'}
              </h2>
              <Link
                href={`/${isAr ? 'ar' : 'en'}/news`}
                className="text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'عرض الكل' : 'View All News'}</span>
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>

            {/* 4 Stacked News Rows matching Reference Image */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2 space-y-2.5">
              {latestArticles.map((art) => {
                const img =
                  normalizeArticleImageUrl(art.imageUrl || art.image) ||
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80'

                return (
                  <article key={art.id} className="pt-2.5 first:pt-0">
                    <Link
                      href={`/${art.language || 'en'}/news/${encodeURIComponent(art.slug)}`}
                      className="group flex items-center gap-3.5 text-start cursor-pointer"
                    >
                      {/* Left Thumbnail with rounded corners */}
                      <div className="relative w-20 sm:w-22 h-14 sm:h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200/40 dark:border-slate-700/60">
                        <Image
                          src={img}
                          alt={art.title}
                          fill
                          loading="lazy"
                          unoptimized
                          sizes="90px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right Text */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-amber-500">{art.category || 'GENERAL'}</span>
                          <span>•</span>
                          <span className="text-slate-400 lowercase first-letter:uppercase">
                            {formatTimeAgo(art.publishedAt, locale)}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                      </div>

                      {/* Chevron Arrow on Far Right */}
                      <div className="shrink-0 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all">
                        <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_right</span>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: "Top Stories" Grid + Trending Pill Card (Matching Reference Image) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-2">
        {/* Top Stories Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Section Header with Amber Vertical Pill + Category Filter Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-amber-400 shadow-sm" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isAr ? 'أهم القصص' : 'Top Stories'}
              </h2>
            </div>

            {/* Filter Pills matching image */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
              {TOP_STORIES_TAGS.map((tag) => {
                const isActive = activeTag === tag.id
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag(tag.id)}
                    className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-[#141e30] dark:text-amber-400 dark:border dark:border-[#223350] shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? tag.labelAr : tag.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3 Equal Cards in Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topStories.map((story) => {
              const img =
                normalizeArticleImageUrl(story.imageUrl || story.image) ||
                'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80'

              return (
                <article
                  key={story.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#182335] shadow-sm group flex flex-col justify-between"
                >
                  <Link
                    href={`/${story.language || 'en'}/news/${encodeURIComponent(story.slug)}`}
                    className="block text-start cursor-pointer"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                      <Image
                        src={img}
                        alt={story.title}
                        fill
                        loading="lazy"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                        {story.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        </div>

        {/* Trending Side Widget (4 cols) matching reference image */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#182335] shadow-lg p-5 space-y-3.5">
            {/* Header: Flame Icon + "Trending" + "Today v" dropdown pill */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 text-lg">local_fire_department</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'الأكثر تداولاً' : 'Trending'}
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#121c2d] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <span>{isAr ? 'اليوم' : 'Today'}</span>
                <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
              </div>
            </div>

            {/* Trending Item #1 */}
            <Link
              href={`/${trendingArticle.language || 'en'}/news/${encodeURIComponent(trendingArticle.slug)}`}
              className="group flex items-center gap-3 text-start p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="w-6 text-center font-black text-sm text-slate-700 dark:text-slate-300">
                1
              </div>
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                <Image
                  src={
                    normalizeArticleImageUrl(trendingArticle.imageUrl || trendingArticle.image) ||
                    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={trendingArticle.title}
                  fill
                  loading="lazy"
                  unoptimized
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                  {trendingArticle.title}
                </h4>
              </div>
              <div className="shrink-0 text-red-500">
                <span className="material-symbols-outlined text-sm">trending_up</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
