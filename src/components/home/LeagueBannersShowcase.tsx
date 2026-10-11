'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/components/common/PurpleDesignBar.module.css'

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
    id: 'laliga',
    titleAr: 'الدوري الإسباني',
    titleEn: 'La Liga',
    categorySlug: 'la-liga',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    accentColor: '#ee2e24',
  },
  {
    id: 'epl',
    titleAr: 'الدوري الإنجليزي الممتاز',
    titleEn: 'Premier League',
    categorySlug: 'premier-league',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    accentColor: '#38003c',
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

  // Match banners with published articles, or default to the top featured leagues
  const matchedBanners = BANNERS.filter((banner) => {
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

  // Display matched banners or default to top leagues so the banner bar is always available
  const visibleBanners = matchedBanners.length > 0 ? matchedBanners : [BANNERS[0]]

  return (
    <div className="w-full space-y-3" aria-label="League Navigation Banners">
      {visibleBanners.map((banner) => {
        const title = isAr ? banner.titleAr : banner.titleEn
        return (
          <Link
            key={banner.id}
            href={`/${locale === 'ar' ? 'ar' : 'en'}/news?category=${banner.categorySlug}`}
            className={`${styles['purple-bar']} group transition-transform duration-200 hover:scale-[1.008] hover:brightness-110 active:scale-[0.995] text-white no-underline`}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Start side: Authentic Colored League Emblem + Crisp Bold Title */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative shrink-0 flex items-center justify-center">
                <Image
                  src={banner.logo}
                  alt={banner.titleEn}
                  width={34}
                  height={34}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-black font-geist text-white tracking-tight truncate">
                {title}
              </span>
            </div>

            {/* End side: Subtle, sleek chevron navigation arrow */}
            <div className="flex items-center text-white/80 group-hover:text-white group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold rtl:rotate-180">
                chevron_right
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
