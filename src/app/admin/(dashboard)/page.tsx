import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let totalArticles = 0
  let publishedCount = 0
  let draftCount = 0
  let scheduledCount = 0
  let totalViews = 0
  let recentArticles: any[] = []
  let dbError: string | null = null

  try {
    const [
      total,
      published,
      draft,
      scheduled,
      totalViewsAgg,
      recent,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.count({ where: { status: 'SCHEDULED' } }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.findMany({
        take: 6,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
    ])

    totalArticles = total
    publishedCount = published
    draftCount = draft
    scheduledCount = scheduled
    totalViews = totalViewsAgg._sum.views || 0
    recentArticles = recent
  } catch (err: any) {
    console.error('[Admin Dashboard] Query error:', err)
    dbError = err.message || 'Database error'
  }

  const statusBadgeClass = (status: string) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232a39]">
        <div>
          <h1 className="text-2xl font-black text-[#dce2f6]">Editorial Dashboard</h1>
          <p className="text-xs text-[#8c947c] mt-1">
            Manage, publish, and schedule football news articles across MyScore24.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#dce2f6] bg-[#19202e] hover:bg-[#232a39] border border-[#232a39] transition-all"
          >
            Manage Articles
          </Link>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#213600] bg-[#ccff80] hover:bg-[#b2f746] shadow transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {dbError && (
        <div className="p-4 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-3">
          <span className="material-symbols-outlined text-xl shrink-0">database</span>
          <div>
            <p className="font-bold">Database Status Warning</p>
            <p className="text-[11px] text-[#ffb4ab]/80 mt-0.5">{dbError}</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-[#151b2a] border border-[#232a39] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c947c]">Total</span>
            <span className="material-symbols-outlined text-base text-[#8c947c]">newspaper</span>
          </div>
          <p className="text-2xl font-black text-[#dce2f6] mt-2">{totalArticles}</p>
          <p className="text-[11px] text-[#8c947c] mt-0.5">All created articles</p>
        </div>

        <div className="bg-[#151b2a] border border-[#232a39] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4ae176]">Published</span>
            <span className="material-symbols-outlined text-base text-[#4ae176]">check_circle</span>
          </div>
          <p className="text-2xl font-black text-[#4ae176] mt-2">{publishedCount}</p>
          <p className="text-[11px] text-[#8c947c] mt-0.5">Live on website</p>
        </div>

        <div className="bg-[#151b2a] border border-[#232a39] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c2cab0]">Drafts</span>
            <span className="material-symbols-outlined text-base text-[#c2cab0]">edit_note</span>
          </div>
          <p className="text-2xl font-black text-[#c2cab0] mt-2">{draftCount}</p>
          <p className="text-[11px] text-[#8c947c] mt-0.5">Unpublished drafts</p>
        </div>

        <div className="bg-[#151b2a] border border-[#232a39] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ccff80]">Scheduled</span>
            <span className="material-symbols-outlined text-base text-[#ccff80]">schedule</span>
          </div>
          <p className="text-2xl font-black text-[#ccff80] mt-2">{scheduledCount}</p>
          <p className="text-[11px] text-[#8c947c] mt-0.5">Queued to release</p>
        </div>

        <div className="bg-[#151b2a] border border-[#232a39] p-4 rounded-xl col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#dce2f6]">Views</span>
            <span className="material-symbols-outlined text-base text-[#dce2f6]">visibility</span>
          </div>
          <p className="text-2xl font-black text-[#dce2f6] mt-2">{totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-[#8c947c] mt-0.5">Total readership</p>
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="bg-[#151b2a] border border-[#232a39] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-[#232a39] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#ccff80]">history</span>
            <h2 className="text-sm font-bold text-[#dce2f6] uppercase tracking-wider">Recent Articles</h2>
          </div>
          <Link
            href="/admin/articles"
            className="text-xs text-[#ccff80] hover:underline font-semibold"
          >
            View all ({totalArticles}) &rarr;
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#424936]">feed</span>
            <p className="text-sm text-[#8c947c]">No articles created yet.</p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#213600] bg-[#ccff80] hover:bg-[#b2f746]"
            >
              Write your first article
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#232a39]">
            {recentArticles.map((art: any) => (
              <div
                key={art.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#19202e]/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#0c1321] border border-[#232a39] shrink-0">
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
                        <span className="material-symbols-outlined text-xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadgeClass(
                          art.status
                        )}`}
                      >
                        {art.status}
                      </span>
                      {art.category && (
                        <span className="text-[11px] text-[#8c947c] font-medium">
                          {art.category.name}
                        </span>
                      )}
                      <span className="text-[11px] text-[#424936]">•</span>
                      <span className="text-[11px] text-[#8c947c]">
                        {formatDate(art.publishedAt || art.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="block text-sm font-bold text-[#dce2f6] hover:text-[#ccff80] transition-colors truncate"
                    >
                      {art.title}
                    </Link>
                    <p className="text-xs text-[#8c947c] truncate">
                      By {art.author?.name || 'MyScore24 Desk'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {art.status === 'PUBLISHED' && (
                    <Link
                      href={`/news/${art.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-[#8c947c] hover:text-[#ccff80] hover:bg-[#232a39] transition-all"
                      title="View live article"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </Link>
                  )}
                  <Link
                    href={`/admin/articles/${art.id}/edit`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dce2f6] bg-[#232a39] hover:bg-[#323949] transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
