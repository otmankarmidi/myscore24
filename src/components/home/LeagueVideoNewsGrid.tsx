'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'

interface LeagueSectionConfig {
  id: string
  titleAr: string
  titleEn: string
  categorySlug: string
  bannerBg: string
  logo: string
  accentColor: string
}

const LEAGUE_SECTIONS: LeagueSectionConfig[] = [
  {
    id: 'epl',
    titleAr: 'الدوري الإنجليزي الممتاز',
    titleEn: 'Premier League',
    categorySlug: 'premier-league',
    bannerBg: 'bg-gradient-to-r from-[#53005b] to-[#2e0033]',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    accentColor: '#38003c',
  },
  {
    id: 'laliga',
    titleAr: 'الدوري الإسباني',
    titleEn: 'La Liga',
    categorySlug: 'la-liga',
    bannerBg: 'bg-gradient-to-r from-[#1a2333] to-[#0f1420]',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    accentColor: '#ee2e24',
  },
]

// Fallback headlines if articles for a specific league are fewer than 6
const FALLBACK_PL_HEADLINES = [
  'توتنهام هوتسبر يفرض التعادل على مانشستر يونايتد في قمة مثيرة',
  'تشلسي يقسو على بورنموث بثلاثية نظيفة خارج الديار',
  'غيمارايش يقود آرسنال لتحقيق فوز صعب ومهم أمام ليدز يونايتد',
  'تشلسي يمدد عقد كول بالمر حتى عام 2034 براتب قياسي',
  'أولد ترافورد مسرحاً لقمة مانشستر يونايتد وتوتنهام المرتقبة',
  'لقاء منتظر بين آرسنال ومضيفه ليدز يونايتد في صراع الصدارة',
]

const FALLBACK_LALIGA_HEADLINES = [
  'ريال مدريد يستعيد نغمة الفوز من بوابة فياريال في البيرنابيو',
  'برشلونة يضيف خيتافي إلى لائحة "ضحاياه" ويواصل التحليق في الصدارة',
  'أتلتيكو مدريد ينجو من فخ ألافيس بصعوبة في اللحظات الأخيرة',
  'إيقاف مباراة رايو فايكانو ومضيفه أتلتيك بلباو بسبب الأمطار',
  'قمة مرتقبة تجمع ريال مدريد بمضيفه فياريال في مواجهة نارية',
  'برشلونة يهدف لمواصلة سلسلة نتائجه الإيجابية محلياً وأوروبياً',
]

interface LeagueVideoNewsGridProps {
  articles?: NewsArticle[]
}

export default function LeagueVideoNewsGrid({ articles = [] }: LeagueVideoNewsGridProps) {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'

  // Filter or slice articles for each league
  const plArticles = articles.filter((a) =>
    (a.category?.toLowerCase() || '').includes('premier') ||
    (a.title?.toLowerCase() || '').includes('arsenal') ||
    (a.title?.toLowerCase() || '').includes('chelsea') ||
    (a.title?.toLowerCase() || '').includes('city') ||
    (a.title?.toLowerCase() || '').includes('united') ||
    (a.title || '').includes('آرسنال') ||
    (a.title || '').includes('مانشستر') ||
    (a.title || '').includes('تشلسي') ||
    (a.title || '').includes('توتنهام')
  )

  const laligaArticles = articles.filter((a) =>
    (a.category?.toLowerCase() || '').includes('liga') ||
    (a.title?.toLowerCase() || '').includes('madrid') ||
    (a.title?.toLowerCase() || '').includes('barcelona') ||
    (a.title || '').includes('مدريد') ||
    (a.title || '').includes('برشلونة') ||
    (a.title || '').includes('فياريال') ||
    (a.title || '').includes('أتلتيكو')
  )

  return (
    <div className="w-full space-y-8 select-none" aria-label="League News Sections">
      {LEAGUE_SECTIONS.map((section, sIdx) => {
        const isPl = section.id === 'epl'
        const relevantArticles = isPl ? plArticles : laligaArticles
        const fallbackTitles = isPl ? FALLBACK_PL_HEADLINES : FALLBACK_LALIGA_HEADLINES

        // Take up to 6 cards
        const displayCards = Array.from({ length: 6 }).map((_, idx) => {
          const art = relevantArticles[idx] || articles[idx + (sIdx * 6)] || null
          const title = art?.title || fallbackTitles[idx]
          const slug = art?.slug || `news-${section.id}-${idx + 1}`
          const rawImg = art ? normalizeArticleImageUrl(art.imageUrl || art.image) : null
          const imageUrl =
            rawImg ||
            (isPl
              ? `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80`
              : `https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80`)

          return {
            id: art?.id || `${section.id}-${idx}`,
            slug,
            title,
            imageUrl,
            categoryLabel: isAr
              ? isPl
                ? 'الدوري الإنجليزي الممتاز'
                : 'الدوري الإسباني - لا ليغا'
              : isPl
              ? 'Premier League'
              : 'La Liga',
          }
        })

        return (
          <section key={section.id} className="w-full space-y-3.5">
            {/* Branded League Header Banner (Matching Image 3) */}
            <Link
              href={`/${locale === 'ar' ? 'ar' : 'en'}/news`}
              className={`w-full rounded-xl px-4 py-3 flex items-center justify-between text-white transition-all shadow-md group ${section.bannerBg} border border-white/10 hover:border-white/20 cursor-pointer`}
            >
              <div className="flex items-center gap-1.5 text-xs text-white/80 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_left</span>
              </div>

              <div className="flex items-center gap-2.5">
                <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight">
                  {isAr ? section.titleAr : section.titleEn}
                </h2>
                <div className="w-7 h-7 relative shrink-0">
                  <Image
                    src={section.logo}
                    alt={section.titleEn}
                    width={28}
                    height={28}
                    className="object-contain drop-shadow"
                  />
                </div>
              </div>
            </Link>

            {/* 6 News / Video Cards in a 3x2 Grid (Matching Image 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {displayCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-xl overflow-hidden bg-[#0d121c] border border-[#1b2334] hover:border-amber-500/60 transition-all shadow-sm group flex flex-col justify-between"
                >
                  <Link
                    href={`/${locale === 'ar' ? 'ar' : 'en'}/news/${encodeURIComponent(card.slug)}`}
                    className="block text-start cursor-pointer"
                  >
                    {/* Top Image with Video Play Icon Overlay (Matching Image 3) */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900 shrink-0">
                      <Image
                        src={card.imageUrl}
                        alt={card.title}
                        fill
                        loading="lazy"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Video Play Circle Icon in Bottom Corner (as seen in Image 3) */}
                      <div className="absolute bottom-2 end-2 w-7 h-7 rounded-full bg-black/65 border border-white/40 flex items-center justify-center text-white shadow-md pointer-events-none group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[16px] leading-none">play_arrow</span>
                      </div>
                    </div>

                    {/* Card Content Below Image */}
                    <div className="p-3 space-y-1.5">
                      {/* League Tag */}
                      <div className="text-[11px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                        {card.categoryLabel}
                      </div>

                      {/* Headline */}
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {card.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
