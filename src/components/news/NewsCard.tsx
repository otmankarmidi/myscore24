'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types/news'
import { formatDate } from '@/lib/utils'

interface NewsCardProps {
  article: NewsArticle
  variant?: 'featured' | 'standard' | 'compact'
}

function getAuthorName(author: NewsArticle['author']): string {
  if (typeof author === 'string') return author
  return author?.name || 'MyScore24 Desk'
}

export default function NewsCard({ article, variant = 'standard' }: NewsCardProps) {
  const rawImageUrl = article.imageUrl || article.image
  const isValidUrl = rawImageUrl && rawImageUrl !== '/og-image.png' && rawImageUrl.trim().length > 0
  const [imageError, setImageError] = useState(false)
  const imageUrl = !imageError && isValidUrl ? rawImageUrl : null

  const authorName = getAuthorName(article.author)

  if (variant === 'featured') {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group relative flex flex-col justify-end rounded-xl overflow-hidden aspect-[16/9] md:aspect-[21/9] border border-surface-bright shadow-lg hover:border-primary transition-all"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            unoptimized
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-bright to-surface-container-lowest flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary/30">newspaper</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative p-4 md:p-6 space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold uppercase tracking-wider text-[10px]">
              {article.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-300 font-medium">{formatDate(article.publishedAt)}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-300">{article.readTimeMinutes || article.readTime || 3} min read</span>
          </div>

          <h2 className="text-headline-lg md:text-headline-xl text-white font-bold group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>

          <p className="text-body-sm text-slate-300 line-clamp-2 max-w-3xl">
            {article.excerpt}
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group flex gap-3 p-2 rounded-lg hover:bg-surface-container-high transition-colors"
      >
        <div className="relative w-20 h-16 rounded overflow-hidden bg-surface-container-high shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              unoptimized
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-xl text-primary/40">newspaper</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-0.5">
          <h4 className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h4>
          <span className="text-[10px] text-on-surface-variant">{formatDate(article.publishedAt)}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col bg-surface-container rounded-lg border border-surface-bright overflow-hidden hover:border-primary transition-all"
    >
      <div className="relative w-full aspect-[16/9] bg-surface-container-high overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            unoptimized
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary/30">newspaper</span>
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur text-primary text-[10px] font-bold uppercase tracking-wider">
          {article.category}
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          <h3 className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-body-sm text-on-surface-variant line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-bright/50">
          <span>{authorName}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
