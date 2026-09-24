'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import NewsCard from '@/components/news/NewsCard'
import { formatDate } from '@/lib/utils'
import { NewsArticle } from '@/types/news'
import { trackArticleOpen } from '@/lib/analytics'

interface NewsArticleClientProps {
  article: NewsArticle
  relatedNews: NewsArticle[]
}

export default function NewsArticleClient({ article, relatedNews }: NewsArticleClientProps) {
  useEffect(() => {
    if (article) {
      trackArticleOpen({
        articleId: article.id || article.slug,
        articleTitle: article.title,
        category: article.category,
      })
    }
  }, [article])
  const authorName =
    typeof article.author === 'string'
      ? article.author
      : article.author?.name || 'MyScore24 Desk'
  const authorAvatar = typeof article.author === 'string' ? undefined : article.author?.avatar
  const authorRole =
    typeof article.author === 'string'
      ? 'Senior Football Analyst'
      : article.author?.role || 'Sports Desk'
  const imageUrl = article.imageUrl || article.image

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold uppercase tracking-wider text-[10px]">
                {article.category}
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{formatDate(article.publishedAt)}</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">
                {article.readTimeMinutes || article.readTime || 3} min read
              </span>
            </div>

            <h1 className="text-headline-xl md:text-headline-xl text-on-surface font-extrabold leading-tight">
              {article.title}
            </h1>

            <p className="text-body-md text-on-surface-variant font-medium leading-relaxed">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-3 pt-3 border-t border-surface-bright">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                {authorAvatar ? (
                  <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-on-surface-variant">
                    {authorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-body-sm font-bold text-on-surface">{authorName}</p>
                <p className="text-[11px] text-on-surface-variant">{authorRole}</p>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface-container-high border border-surface-bright">
            {imageUrl ? (
              <Image src={imageUrl} alt={article.title} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-surface-container-highest" />
            )}
          </div>

          <article className="prose prose-invert max-w-none space-y-4 text-body-md leading-relaxed text-on-surface/90 font-inter">
            <p>{article.content}</p>
            <p>
              Both managers acknowledged the tactical intensity of the clash during post-match interviews, noting that microscopic margin decisions heavily influenced the outcome. Analytics tracking demonstrated a 14% increase in high-intensity sprints compared to previous seasonal benchmarks.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-on-surface font-semibold bg-surface-container p-3 rounded-r">
              &ldquo;Matches at this level are decided by fractions of a second and ruthless execution in transition phase.&rdquo;
            </blockquote>
            <p>
              Fans can expect further updates regarding team recovery, updated squad availability, and revised league table standing calculations as the upcoming matchweek draws near.
            </p>
          </article>

          <div className="pt-6 border-t border-surface-bright space-y-4">
            <h2 className="font-bold text-body-md text-on-surface uppercase tracking-wider">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedNews.map((rel) => (
                <NewsCard key={rel.id} article={rel} variant="standard" />
              ))}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
