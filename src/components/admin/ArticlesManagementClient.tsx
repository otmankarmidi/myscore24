'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface ArticleItem {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
  views: number
  category?: { id: string; name: string; slug: string } | null
  author?: { id: string; name: string } | null
  tags?: { id: string; name: string }[]
}

interface CategoryItem {
  id: string
  name: string
  slug: string
}

export default function ArticlesManagementClient() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.categories) setCategories(data.categories)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter)
      if (categoryFilter) params.set('categoryId', categoryFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      params.set('page', page.toString())
      params.set('limit', '15')

      const res = await fetch(`/api/admin/articles?${params.toString()}`)
      const data = await res.json()

      if (data.articles) {
        setArticles(data.articles)
        setTotalPages(data.pagination.totalPages || 1)
        setTotalCount(data.pagination.totalCount || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, categoryFilter, searchQuery, page])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the article: "${title}"?\nThis cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id))
        setTotalCount((prev) => Math.max(0, prev - 1))
      } else {
        alert(data.error || 'Failed to delete article')
      }
    } catch {
      alert('Error occurred while deleting article')
    } finally {
      setDeletingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-[#003915] text-[#4ae176] border-[#00b954]/30'
      case 'DRAFT':
        return 'bg-[#232a39] text-[#c2cab0] border-[#323949]'
      case 'SCHEDULED':
        return 'bg-[#416400]/40 text-[#ccff80] border-[#a3e635]/30'
      case 'ARCHIVED':
        return 'bg-[#323949] text-[#8c947c] border-[#424936]'
      default:
        return 'bg-[#232a39] text-[#dce2f6]'
    }
  }

  const statuses = [
    { key: 'ALL', label: 'All Articles' },
    { key: 'PUBLISHED', label: 'Published' },
    { key: 'DRAFT', label: 'Drafts' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'ARCHIVED', label: 'Archived' },
  ]

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a39]">
        <div>
          <h1 className="text-2xl font-black text-[#dce2f6]">Articles Management</h1>
          <p className="text-xs text-[#8c947c] mt-1">
            Browse, filter, edit, or delete articles ({totalCount} total)
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#213600] bg-[#ccff80] hover:bg-[#b2f746] transition-all shadow"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>Create Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#232a39]">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setStatusFilter(s.key)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                statusFilter === s.key
                  ? 'bg-[#232a39] text-[#ccff80]'
                  : 'text-[#8c947c] hover:text-[#dce2f6]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#8c947c]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by title, excerpt, or slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              aria-label="Filter by category"
              className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#151b2a] border border-[#232a39] rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#ccff80] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8c947c]">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#424936]">find_in_page</span>
            <p className="text-sm text-[#8c947c]">No articles found matching criteria.</p>
            <button
              onClick={() => {
                setStatusFilter('ALL')
                setCategoryFilter('')
                setSearchQuery('')
              }}
              className="text-xs text-[#ccff80] hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1321] text-[#8c947c] uppercase tracking-wider font-semibold border-b border-[#232a39]">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232a39]">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-[#19202e]/60 transition-colors">
                    {/* Article Thumbnail + Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0c1321] border border-[#232a39] shrink-0">
                          {art.featuredImage ? (
                            <Image
                              src={art.featuredImage}
                              alt={art.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#424936]">
                              <span className="material-symbols-outlined text-lg">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="font-bold text-[#dce2f6] hover:text-[#ccff80] transition-colors line-clamp-1"
                          >
                            {art.title}
                          </Link>
                          <p className="text-[11px] text-[#8c947c] font-mono truncate">
                            /{art.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-[#c2cab0] whitespace-nowrap">
                      {art.category?.name || 'Uncategorized'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadge(
                          art.status
                        )}`}
                      >
                        {art.status}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 text-[#8c947c] whitespace-nowrap">
                      {art.author?.name || 'Desk'}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[#8c947c] whitespace-nowrap">
                      {formatDate(art.publishedAt || art.createdAt)}
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-right font-mono font-medium text-[#dce2f6]">
                      {art.views.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.status === 'PUBLISHED' && (
                          <Link
                            href={`/news/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-md text-[#8c947c] hover:text-[#ccff80] hover:bg-[#232a39] transition-all"
                            title="View public page"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="p-1.5 rounded-md text-[#8c947c] hover:text-[#dce2f6] hover:bg-[#232a39] transition-all"
                          title="Edit article"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          disabled={deletingId === art.id}
                          className="p-1.5 rounded-md text-[#ffb4ab] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-all disabled:opacity-50"
                          title="Delete article"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#232a39] bg-[#0c1321] flex items-center justify-between">
            <span className="text-xs text-[#8c947c]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-[#19202e] border border-[#232a39] text-xs text-[#dce2f6] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-[#19202e] border border-[#232a39] text-xs text-[#dce2f6] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
