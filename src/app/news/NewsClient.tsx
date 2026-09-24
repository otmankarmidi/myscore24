'use client'

import { useState } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import NewsCard from '@/components/news/NewsCard'
import { NewsArticle } from '@/types/news'

interface NewsClientProps {
  initialArticles: NewsArticle[]
}

export default function NewsClient({ initialArticles }: NewsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Collect distinct categories from articles
  const categorySet = new Set<string>()
  initialArticles.forEach((a) => {
    if (a.category) categorySet.add(a.category.toLowerCase())
  })
  const categories = ['all', ...Array.from(categorySet)]

  const filteredNews =
    activeCategory === 'all'
      ? initialArticles
      : initialArticles.filter((n) => n.category.toLowerCase() === activeCategory.toLowerCase())

  const featured = filteredNews[0]
  const listNews = filteredNews.filter((n) => n.id !== featured?.id)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                newspaper
              </span>
              <span>Football News & Analysis</span>
            </div>
            <h1 className="text-headline-xl text-on-surface font-extrabold">Latest Football Headlines</h1>
            <p className="text-body-sm text-on-surface-variant">
              Breaking news, transfer rumors, match previews, and tactical analysis from around the world.
            </p>
          </div>

          {/* Category Bar */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-lg border border-surface-bright overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Hero Article */}
          {featured && (
            <NewsCard article={featured} variant="featured" />
          )}

          {/* News Grid */}
          {listNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listNews.map((article) => (
                <NewsCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          ) : !featured ? (
            <div className="bg-surface-container rounded-xl border border-surface-bright p-8 text-center text-on-surface-variant text-sm">
              No articles found in this category.
            </div>
          ) : null}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
