'use client'

import { useState, useMemo } from 'react'
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

  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  const day = date.getUTCDate()
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const monthStr = isAr ? monthNamesAr[date.getUTCMonth()] : monthNamesEn[date.getUTCMonth()]

  return isAr
    ? `${day} ${monthStr} في ${timeStr}`
    : `${day} ${monthStr} at ${timeStr}`
}

export default function HomeNewsMagazine({ articles = [] }: HomeNewsMagazineProps) {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'
  const [activeTag, setActiveTag] = useState<string>('all')
  const [heroIndex, setHeroIndex] = useState<number>(0)

  if (!articles || articles.length === 0) {
    return null
  }

  // 1. Featured Hero Stories (up to 3 for interactive carousel navigation)
  const featuredArticles = articles.slice(0, Math.min(3, articles.length))
  const heroArticle = featuredArticles[heroIndex] || articles[0]
  const heroImage =
    normalizeArticleImageUrl(heroArticle.imageUrl || heroArticle.image) ||
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80'

  // 2. Latest News List (next 4 articles, displayed in the 38% right panel)
  const latestArticles = articles.slice(1, 5)

  // 3. Filtered Top Stories (in-memory filtering without any API calls)
  const filteredTopStories = useMemo(() => {
    if (activeTag === 'all') {
      return articles.slice(5, 8).length > 0 ? articles.slice(5, 8) : articles.slice(1, 4)
    }

    const query = activeTag.toLowerCase().replace(/-/g, ' ')
    const matches = articles.filter((a) => {
      const cat = (a.category || '').toLowerCase()
      const slug = (a.categorySlug || '').toLowerCase()
      const title = (a.title || '').toLowerCase()
      const tags = (a.tags || []).map((t) => t.toLowerCase())

      return (
        cat.includes(query) ||
        slug.includes(activeTag) ||
        title.includes(query) ||
        tags.some((t) => t.includes(query) || t.includes(activeTag))
      )
    })

    return matches.length > 0
      ? matches.slice(0, 3)
      : articles.slice(5, 8).length > 0
      ? articles.slice(5, 8)
      : articles.slice(1, 4)
  }, [articles, activeTag])

  // 4. Trending Stories (top real published stories for the right-hand column)
  const trendingArticles = useMemo(() => {
    const pool = articles.length > 8 ? articles.slice(8, 11) : articles.slice(0, 3)
    return pool
  }, [articles])

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev > 0 ? prev - 1 : featuredArticles.length - 1))
  }

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev < featuredArticles.length - 1 ? prev + 1 : 0))
  }

  return (
    <section className="w-full space-y-6 select-none" aria-label="Hero Editorial and Latest News">
      {/* ── TOP SECTION: Hero Story (approx 62%) + Latest News Sidebar (approx 38%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Dominant Hero Card (62% desktop / 8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="group relative w-full h-[420px] sm:h-[470px] md:h-[510px] rounded-3xl overflow-hidden bg-slate-900 border border-[#E5E5E5] dark:border-[#182335] shadow-xs flex flex-col justify-end p-6 sm:p-8 md:p-10">
            {/* Background Hero Image with high-priority responsive optimization */}
            <Image
              src={heroImage}
              alt={heroArticle.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 920px"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />

            {/* Cinematic dark gradients matching reference image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-2xl space-y-3">
              {/* Category pill & Timestamp */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <span className="bg-[#6425A6]/80 text-white px-2 py-0.5 rounded-full text-[10px]">{heroArticle.category || 'ANALYSIS'}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 font-medium lowercase first-letter:uppercase">
                  {formatTimeAgo(heroArticle.publishedAt, locale)}
                </span>
              </div>

              {/* Big Bold Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-sm group-hover:text-purple-200 transition-colors">
                <Link href={`/${heroArticle.language || 'en'}/news/${encodeURIComponent(heroArticle.slug)}`}>
                  {heroArticle.title}
                </Link>
              </h2>

              {/* Excerpt / Summary */}
              {heroArticle.excerpt && (
                <p className="text-xs sm:text-sm text-slate-200/90 line-clamp-2 leading-relaxed">
                  {heroArticle.excerpt}
                </p>
              )}

              {/* Bottom Controls Row: Purple CTA Button + Carousel Nav Dots & Chevrons */}
              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <Link
                  href={`/${heroArticle.language || 'en'}/news/${encodeURIComponent(heroArticle.slug)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6425A6] hover:bg-[#521c8c] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'اقرأ المقال كاملاً' : 'Read Full Story'}</span>
                  <span className="material-symbols-outlined text-base rtl:rotate-180">arrow_forward</span>
                </Link>

                {/* Left/Right Round Chevrons + Progress Bars */}
                {featuredArticles.length > 1 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevHero}
                        aria-label="Previous story"
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextHero}
                        aria-label="Next story"
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
                      </button>
                    </div>

                    {/* Progress Indicator Bars */}
                    <div className="flex items-center gap-1.5">
                      {featuredArticles.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setHeroIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-1 rounded-full transition-all cursor-pointer ${
                            idx === heroIndex ? 'w-6 bg-purple-400' : 'w-4 bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Latest News Sidebar Card (38% desktop / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="h-full rounded-3xl bg-white dark:bg-[#0c121e] border border-[#E5E5E5] dark:border-[#182335] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
            {/* Header: "Latest News" on left, "View All News ->" on right */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5] dark:border-slate-800/80">
              <h2 className="text-xl font-black text-[#171717] dark:text-white tracking-tight">
                {isAr ? 'آخر الأخبار' : 'Latest News'}
              </h2>
              <Link
                href={`/${isAr ? 'ar' : 'en'}/news`}
                className="text-xs font-bold text-[#6425A6] dark:text-slate-400 hover:opacity-80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'عرض الكل' : 'View All News'}</span>
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>

            {/* 4 Stacked News Rows */}
            <div className="divide-y divide-[#F5F5F5] dark:divide-slate-800/60 my-2 space-y-3">
              {latestArticles.map((art) => {
                const img =
                  normalizeArticleImageUrl(art.imageUrl || art.image) ||
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80'

                return (
                  <article key={art.id} className="pt-3 first:pt-0">
                    <Link
                      href={`/${art.language || 'en'}/news/${encodeURIComponent(art.slug)}`}
                      className="group flex items-center gap-3.5 text-start cursor-pointer"
                    >
                      {/* Left Thumbnail with rounded corners */}
                      <div className="relative w-22 sm:w-24 h-15 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-[#E5E5E5] dark:border-slate-800 shadow-inner">
                        <Image
                          src={img}
                          alt={art.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right Text */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                          <span className="px-1.5 py-0.5 rounded bg-[#F3ECFA] text-[#6425A6] dark:bg-amber-500/20 dark:text-amber-400">
                            {art.category || 'ANALYSIS'}
                          </span>
                          <span className="text-[#6B7280] dark:text-slate-400">•</span>
                          <span className="text-[#6B7280] dark:text-slate-400 lowercase first-letter:uppercase font-medium">
                            {formatTimeAgo(art.publishedAt, locale)}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-[13px] font-bold text-[#171717] dark:text-slate-100 group-hover:text-[#6425A6] dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                      </div>

                      {/* Chevron Arrow on Far Right */}
                      <div className="shrink-0 text-[#6B7280] dark:text-slate-400 group-hover:text-[#6425A6] dark:group-hover:text-amber-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all">
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
          {/* Section Header with Purple Vertical Pill + Category Filter Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-[#6425A6] shadow-xs" />
              <h2 className="text-base sm:text-lg font-black text-[#171717] dark:text-white tracking-tight">
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
                        ? 'bg-[#6425A6] text-white shadow-xs dark:bg-[#182335] dark:text-amber-400'
                        : 'text-[#6B7280] dark:text-slate-400 hover:text-[#6425A6] dark:hover:text-white hover:bg-[#F3ECFA] dark:hover:bg-slate-800/80'
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
            {filteredTopStories.map((story) => {
              const img =
                normalizeArticleImageUrl(story.imageUrl || story.image) ||
                'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80'

              return (
                <article
                  key={story.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c121e] border border-[#E5E5E5] dark:border-[#182335] shadow-xs hover:border-[#6425A6]/40 hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <Link
                    href={`/${story.language || 'en'}/news/${encodeURIComponent(story.slug)}`}
                    className="block text-start cursor-pointer"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <Image
                        src={img}
                        alt={story.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#171717] dark:text-white group-hover:text-[#6425A6] dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
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
          <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-[#E5E5E5] dark:border-[#182335] shadow-xs p-5 space-y-3.5">
            {/* Header: Flame Icon + "Trending" + "Today v" dropdown pill */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5E5] dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6425A6] dark:text-orange-500 text-lg">local_fire_department</span>
                <h3 className="text-base font-black text-[#171717] dark:text-white">
                  {isAr ? 'الأكثر تداولاً' : 'Trending'}
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#121c2d] border border-[#E5E5E5] dark:border-slate-800 text-[11px] font-bold text-[#171717] dark:text-slate-300 flex items-center gap-1">
                <span>{isAr ? 'اليوم' : 'Today'}</span>
                <span className="material-symbols-outlined text-xs text-[#6B7280] dark:text-slate-400">expand_more</span>
              </div>
            </div>

            {/* Trending Items List */}
            <div className="space-y-2">
              {trendingArticles.map((art, idx) => {
                const img =
                  normalizeArticleImageUrl(art.imageUrl || art.image) ||
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80'

                return (
                  <Link
                    key={art.id}
                    href={`/${art.language || 'en'}/news/${encodeURIComponent(art.slug)}`}
                    className="group flex items-center gap-3 text-start p-1.5 rounded-xl hover:bg-[#F3ECFA] dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-5 text-center font-black text-sm text-[#6425A6] dark:text-slate-400">
                      {idx + 1}
                    </div>
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-[#E5E5E5] dark:border-slate-700 shadow-inner">
                      <Image
                        src={img}
                        alt={art.title}
                        fill
                        loading="lazy"
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#171717] dark:text-slate-200 group-hover:text-[#6425A6] dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                    </div>
                    <div className="shrink-0 text-red-500">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
