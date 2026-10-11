'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'
import { formatRelativeDate } from '@/lib/utils'

interface HomeTrendingNewsProps {
  articles?: NewsArticle[]
}

/**
 * Format relative time badge with icon, e.g. "قبل 3 ساعات • ريال مدريد"
 */
function formatTrendingMeta(publishedAt?: string, tagOrCategory?: string, locale: string = 'ar') {
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'
  const timeStr = formatRelativeDate(publishedAt || new Date().toISOString(), locale)
  const tag = tagOrCategory || (isAr ? 'كرة القدم' : isFr ? 'Football' : 'Football')

  if (isAr) {
    return `${timeStr} • ${tag}`
  }
  return `${timeStr} • ${tag}`
}

export default function HomeTrendingNews({ articles = [] }: HomeTrendingNewsProps) {
  const { locale } = useLanguage()
  const [heroImgError, setHeroImgError] = useState(false)

  if (!articles || articles.length === 0) {
    return null
  }

  // Hero trending article
  const heroArticle = articles[0]
  // 3 stacked trending items
  const stackedArticles = articles.slice(1, 4)

  const heroImageUrl = normalizeArticleImageUrl(heroArticle.imageUrl || heroArticle.image)
  const validHeroImg = !heroImgError && heroImageUrl ? heroImageUrl : null

  return (
    <section
      aria-label="Trending News"
      className="relative overflow-hidden rounded-2xl bg-[#0e121a] border border-[#1e2535] p-3.5 sm:p-5 shadow-xl select-none"
    >
      {/* Decorative Orange Ambient Glow / Curved Accent on Left Edge (Matching Image 1) */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-br from-orange-600/25 to-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-28 -translate-y-1/2 w-56 h-56 rounded-full border border-orange-500/15 pointer-events-none" />
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-40 h-40 rounded-full border border-orange-500/10 pointer-events-none" />

      {/* Header: "الأخبار الرائجة" with Fire Icon in circle */}
      <div className={`relative z-10 flex items-center gap-2.5 pb-4 border-b border-slate-800/60 mb-4 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
        {locale === 'ar' ? (
          <>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              الأخبار الرائجة
            </h2>
            <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[17px] leading-none">local_fire_department</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[17px] leading-none">local_fire_department</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {locale === 'fr' ? 'Actualités Tendances' : 'Trending News'}
            </h2>
          </>
        )}
      </div>

      {/* Main 2-Column Grid (In RTL Hero on Right, in LTR Hero on Left) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Dominant Hero Trending Article (6 cols) */}
        <div
          className={`${
            stackedArticles.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
          } flex flex-col justify-between`}
        >
          <Link
            href={`/${heroArticle.language || 'en'}/news/${encodeURIComponent(heroArticle.slug)}`}
            className="group flex flex-col h-full text-start cursor-pointer"
          >
            {/* Main Featured Image with Rounded Corners */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md shrink-0">
              {validHeroImg ? (
                <Image
                  src={validHeroImg}
                  alt={heroArticle.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                  onError={() => setHeroImgError(true)}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-orange-500/30">local_fire_department</span>
                </div>
              )}
            </div>

            {/* Hero Text Content */}
            <div className="pt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{formatTrendingMeta(heroArticle.publishedAt, heroArticle.tags?.[0] || heroArticle.category, locale)}</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                {heroArticle.title}
              </h3>
            </div>
          </Link>
        </div>

        {/* 3 Stacked Cards (6 cols) */}
        {stackedArticles.length > 0 && (
          <div className="lg:col-span-6 flex flex-col justify-between gap-3">
            {stackedArticles.map((art) => {
              const imgUrl = normalizeArticleImageUrl(art.imageUrl || art.image)
              const metaText = formatTrendingMeta(art.publishedAt, art.tags?.[0] || art.category, locale)

              return (
                <Link
                  key={art.id}
                  href={`/${art.language || 'en'}/news/${encodeURIComponent(art.slug)}`}
                  className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-[#141924]/90 hover:bg-[#1b2232] border border-[#202738] transition-all text-start cursor-pointer shadow-sm"
                >
                  {locale === 'ar' ? (
                    <>
                      {/* Content on Right in RTL */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                          <span className="truncate">{metaText}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                      </div>

                      {/* Thumbnail on Left in RTL */}
                      <div className="relative w-24 sm:w-28 h-18 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 shadow-inner">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={art.title}
                            fill
                            loading="lazy"
                            unoptimized
                            sizes="(max-width: 768px) 112px, 120px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <span className="material-symbols-outlined text-2xl text-orange-500/40">newspaper</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Thumbnail on Left in LTR */}
                      <div className="relative w-24 sm:w-28 h-18 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 shadow-inner">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={art.title}
                            fill
                            loading="lazy"
                            unoptimized
                            sizes="(max-width: 768px) 112px, 120px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <span className="material-symbols-outlined text-2xl text-orange-500/40">newspaper</span>
                          </div>
                        )}
                      </div>

                      {/* Content on Right in LTR */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                          <span className="truncate">{metaText}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                      </div>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

