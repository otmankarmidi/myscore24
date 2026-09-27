import { prisma } from '../src/lib/prisma'
import { getHomepageLatestArticles } from '../src/lib/articles'
import { normalizeArticleImageUrl, getArticleOgImageUrl } from '../src/lib/newsImage'
import enDict from '../src/lib/i18n/en.json'
import frDict from '../src/lib/i18n/fr.json'
import arDict from '../src/lib/i18n/ar.json'

async function testHomepageNews() {
  console.log('=== TEST 1: MySQL Query Verification ===')
  const articles = await getHomepageLatestArticles(6)
  console.log(`Retrieved ${articles.length} articles for homepage.`)

  if (articles.length === 0) {
    console.error('ERROR: No articles returned from database!')
    process.exit(1)
  }

  console.log('\n=== TEST 2: Featured Story Selection ===')
  const featured = articles[0]
  console.log('Featured Story Title:', featured.title)
  console.log('Featured Slug:', featured.slug)
  console.log('Featured Category:', featured.category)
  console.log('Featured PublishedAt:', featured.publishedAt)
  console.log('Featured Image (Raw):', featured.image)
  console.log('Featured Image (Normalized):', normalizeArticleImageUrl(featured.image))
  console.log('Featured OG URL (SEO):', getArticleOgImageUrl(featured.image))

  console.log('\n=== TEST 3: Left Column Articles (2 stacked cards on desktop) ===')
  const leftArticles = articles.slice(1, 3)
  console.log(`Left column count: ${leftArticles.length}`)
  leftArticles.forEach((a, i) => {
    console.log(`  [Left ${i + 1}] Title: ${a.title}`)
    console.log(`             Slug: /news/${a.slug}`)
    console.log(`             Category: ${a.category}`)
    console.log(`             Image: ${normalizeArticleImageUrl(a.image) || 'FALLBACK PLACEHOLDER'}`)
  })

  console.log('\n=== TEST 4: Bottom Row Articles (up to 3 horizontal cards on desktop) ===')
  const bottomArticles = articles.slice(3, 6)
  console.log(`Bottom row count: ${bottomArticles.length}`)
  bottomArticles.forEach((a, i) => {
    console.log(`  [Bottom ${i + 1}] Title: ${a.title}`)
    console.log(`               Slug: /news/${a.slug}`)
    console.log(`               Category: ${a.category}`)
    console.log(`               Image: ${normalizeArticleImageUrl(a.image) || 'FALLBACK PLACEHOLDER'}`)
  })

  console.log('\n=== TEST 5: i18n Dictionary Keys Verification ===')
  const enNews = (enDict as any).news
  const frNews = (frDict as any).news
  const arNews = (arDict as any).news

  console.log('EN:', { latestNews: enNews.latestNews, viewAll: enNews.viewAll })
  console.log('FR:', { latestNews: frNews.latestNews, viewAll: frNews.viewAll })
  console.log('AR (RTL):', { latestNews: arNews.latestNews, viewAll: arNews.viewAll })

  if (!enNews.latestNews || !frNews.latestNews || !arNews.latestNews) {
    console.error('ERROR: Missing i18n keys!')
    process.exit(1)
  }

  console.log('\n=== TEST 6: Adaptability with Fewer Articles ===')
  // Verify slices work cleanly for edge cases (0, 1, 2, 4 articles)
  for (const count of [0, 1, 2, 4, 6]) {
    const subset = articles.slice(0, count)
    const f = subset[0] || null
    const l = subset.slice(1, 3)
    const b = subset.slice(3, 6)
    console.log(`  Dataset size ${count} -> Featured: ${f ? 'YES' : 'NONE'}, Left: ${l.length}, Bottom: ${b.length}`)
  }

  console.log('\nALL HOMEPAGE NEWS TESTS PASSED SUCCESSFULLY!')
}

testHomepageNews().catch(console.error).finally(() => prisma.$disconnect())
