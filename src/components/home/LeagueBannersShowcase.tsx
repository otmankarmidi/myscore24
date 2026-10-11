'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { useLanguage } from '@/context/LanguageContext'

interface LeagueBanner {
  id: string
  titleAr: string
  titleEn: string
  categorySlug: string
  logo: string
  accentColor: string
}

const BANNERS: LeagueBanner[] = [
  {
    id: 'epl',
    titleAr: 'الدوري الإنجليزي الممتاز',
    titleEn: 'Premier League',
    categorySlug: 'premier-league',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    accentColor: '#38003c',
  },
  {
    id: 'laliga',
    titleAr: 'الدوري الإسباني',
    titleEn: 'La Liga',
    categorySlug: 'la-liga',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    accentColor: '#ee2e24',
  },
  {
    id: 'ligue1',
    titleAr: 'الدوري الفرنسي',
    titleEn: 'Ligue 1',
    categorySlug: 'ligue-1',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    accentColor: '#091c3e',
  },
  {
    id: 'botola',
    titleAr: 'البطولة الوطنية الإحترافية',
    titleEn: 'Botola Pro Inwi',
    categorySlug: 'botola-pro',
    logo: 'https://media.api-sports.io/football/leagues/200.png',
    accentColor: '#064e3b',
  },
]

interface LeagueBannersShowcaseProps {
  articles?: NewsArticle[]
}

export default function LeagueBannersShowcase({ articles = [] }: LeagueBannersShowcaseProps) {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'

  // Only show banners that actually have articles published for them
  const visibleBanners = BANNERS.filter((banner) => {
    return articles.some((a) => {
      const slug = (a.categorySlug || '').toLowerCase()
      const cat = (a.category || '').toLowerCase()
      const tags = (a.tags || []).map((t) => t.toLowerCase())

      if (banner.id === 'epl') {
        return (
          slug === 'premier-league' ||
          cat === 'premier-league' ||
          cat === 'premier league' ||
          cat.includes('premier') ||
          cat.includes('الدوري الإنجليزي') ||
          cat.includes('الدوري الانجليزي') ||
          tags.some((t) => t.includes('premier') || t.includes('إنجليزي') || t.includes('انجليزي') || t.includes('epl'))
        )
      }
      if (banner.id === 'laliga') {
        return (
          slug === 'la-liga' ||
          slug === 'laliga' ||
          cat === 'la-liga' ||
          cat === 'la liga' ||
          cat === 'laliga' ||
          cat.includes('الدوري الإسباني') ||
          cat.includes('الدوري الاسباني') ||
          tags.some((t) => t.includes('liga') || t.includes('إسباني') || t.includes('اسباني'))
        )
      }
      if (banner.id === 'ligue1') {
        return (
          slug === 'ligue-1' ||
          cat === 'ligue-1' ||
          cat.includes('ligue 1') ||
          cat.includes('الدوري الفرنسي') ||
          tags.some((t) => t.includes('ligue 1') || t.includes('فرنسي'))
        )
      }
      if (banner.id === 'botola') {
        return (
          slug === 'botola-pro' ||
          cat === 'botola-pro' ||
          cat.includes('botola') ||
          cat.includes('البطولة الوطنية') ||
          tags.some((t) => t.includes('botola') || t.includes('بطولة'))
        )
      }
      return slug === banner.categorySlug || cat.includes(banner.categorySlug)
    })
  })

  // If no articles match any of the banners, hide the entire section
  if (visibleBanners.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-3" aria-label="League Navigation Banners">
      {visibleBanners.map((banner) => {
        const title = isAr ? banner.titleAr : banner.titleEn
        return (
          <Link
            key={banner.id}
            href={`/${locale === 'ar' ? 'ar' : 'en'}/news?category=${banner.categorySlug}`}
            className="group relative w-full h-[64px] sm:h-[70px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#060b14] via-[#091222] to-[#0c162a] border border-[#182740] hover:border-sky-400/50 flex items-center justify-between px-5 sm:px-6 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-sky-500/5"
          >
            {/* Left Diagonal Hatched / Watermark Lines pattern (Matching Image 1) */}
            <div
              className="absolute left-0 top-0 bottom-0 w-32 sm:w-44 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #0284c7 0, #0284c7 2px, transparent 0, transparent 10px)',
              }}
            />

            {/* Left Subtle chevron accent */}
            <div className="relative z-10 flex items-center text-slate-500 group-hover:text-sky-400 transition-colors">
              <span className="material-symbols-outlined text-2xl font-bold rtl:rotate-180">
                chevron_right
              </span>
            </div>

            {/* Right side: Bold Title + White Emblem League Logo */}
            <div className="relative z-10 flex items-center gap-3.5">
              <span className="text-sm sm:text-base md:text-lg font-black text-white group-hover:text-sky-400 transition-colors tracking-tight">
                {title}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-black/40 border border-white/10 group-hover:scale-105 transition-transform">
                <Image
                  src={banner.logo}
                  alt={banner.titleEn}
                  width={32}
                  height={32}
                  className="object-contain filter brightness-0 invert drop-shadow"
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
