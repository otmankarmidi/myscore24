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
    <section className="ui-card rounded-2xl p-2" aria-label="Latest news">
      <div className="flex items-center justify-between px-3 pt-2 pb-2">
        <p className="ui-eyebrow">{ar ? 'آخر الأخبار' : 'Latest news'}</p>
        <Link href="/news" className="text-[12px] font-semibold text-brand hover:underline">{ar ? 'الكل' : 'All'}</Link>
      </div>
      <Link href={href(lead)} className="ui-press group block relative h-44 rounded-xl overflow-hidden bg-canvas">
        <Image src={img(lead)} alt={lead.imageAlt || lead.title} fill sizes="400px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/90 to-transparent" />
        <span className="absolute bottom-0 inset-x-0 p-3.5">
          <span className="inline-flex h-5 px-1.5 items-center rounded bg-brand text-[10px] font-bold uppercase tracking-wider text-white">{lead.category}</span>
          <span className="block text-[15px] font-semibold leading-snug text-white line-clamp-2 mt-1.5">{lead.title}</span>
        </span>
      </Link>
      <ul className="mt-1">
        {rest.slice(0, 3).map((a) => (
          <li key={a.id}>
            <Link href={href(a)} className="ui-press group flex items-center gap-3 p-2.5 rounded-xl hover:bg-hover transition-colors">
              <span className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-canvas">
                <Image src={img(a)} alt={a.imageAlt || a.title} fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </span>
              <span className="text-[13px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-brand transition-colors">{a.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
