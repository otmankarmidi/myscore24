'use client'

import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { normalizeArticleImageUrl } from '@/lib/newsImage'
import { useLanguage } from '@/context/LanguageContext'

const FALLBACK = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=70'

export default function NewsCard({ articles }: { articles: NewsArticle[] }) {
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  if (!articles.length) return null
  const [lead, ...rest] = articles

  const href = (a: NewsArticle) => `/${a.language || 'en'}/news/${encodeURIComponent(a.slug)}`
  const img = (a: NewsArticle) => normalizeArticleImageUrl(a.imageUrl || a.image) || FALLBACK

  return (
    <section className="gl-panel rounded-3xl p-2" aria-label="Latest news">
      <div className="flex items-center justify-between px-3 pt-2 pb-2">
        <p className="gl-eyebrow">{ar ? 'آخر الأخبار' : 'Latest news'}</p>
        <Link href="/news" className="text-[11.5px] font-semibold text-accent-cyan hover:underline">{ar ? 'الكل' : 'All'}</Link>
      </div>
      <Link href={href(lead)} className="group block relative h-44 rounded-2xl overflow-hidden">
        <Image src={img(lead)} alt={lead.imageAlt || lead.title} fill sizes="400px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#070A1A] via-[#070A1A]/40 to-transparent" />
        <span className="absolute bottom-0 inset-x-0 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-accent-cyan">{lead.category}</span>
          <span className="block text-[15px] font-semibold leading-snug text-white line-clamp-2 mt-0.5">{lead.title}</span>
        </span>
      </Link>
      <ul className="mt-1">
        {rest.slice(0, 3).map((a) => (
          <li key={a.id}>
            <Link href={href(a)} className="gl-row flex items-center gap-3 p-2.5 rounded-xl">
              <span className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/5">
                <Image src={img(a)} alt={a.imageAlt || a.title} fill sizes="56px" className="object-cover" />
              </span>
              <span className="text-[13px] font-medium leading-snug text-white/90 line-clamp-2">{a.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
