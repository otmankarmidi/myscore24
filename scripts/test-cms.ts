import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import {
  getAdminCredentials,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '../src/lib/adminAuth'

function loadEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const match = trimmed.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      })
    }
  }
}

loadEnv()

const prisma = new PrismaClient()

async function testCMS() {
  console.log('🧪 Starting Full CMS Verification Test Suite...')

  // 1. Test Admin Auth Token Sign & Verify
  console.log('\n--- 1. Testing Admin Auth & HMAC Tokens ---')
  const creds = getAdminCredentials()
  console.log(`✓ Admin Username detected: "${creds.username}"`)
  console.log(`✓ Admin Password configured: ${creds.password ? 'YES (configured)' : 'NO'}`)

  const token = createAdminSessionToken(creds.username)
  const verification = verifyAdminSessionToken(token)
  if (!verification.valid || verification.username !== creds.username) {
    throw new Error('HMAC session token verification failed!')
  }
  console.log('✅ HMAC session token successfully created and verified.')

  const invalidVerification = verifyAdminSessionToken('corrupted-token-1234')
  if (invalidVerification.valid) {
    throw new Error('Corrupted token passed verification unexpectedly!')
  }
  console.log('✅ Corrupted token correctly rejected.')

  // 2. Test Category and Author presence
  console.log('\n--- 2. Testing Database Models & Seed Data ---')
  const categories = await prisma.category.findMany()
  console.log(`✓ Categories found in MySQL: ${categories.length}`)
  if (categories.length === 0) throw new Error('No categories found!')

  const authors = await prisma.author.findMany()
  console.log(`✓ Authors found in MySQL: ${authors.length}`)
  if (authors.length === 0) throw new Error('No authors found!')

  // 3. Test Article Creation (Draft)
  console.log('\n--- 3. Testing Article Creation & Publishing Lifecycle ---')
  const testSlug = `test-cms-article-${Date.now()}`
  const created = await prisma.article.create({
    data: {
      title: 'Automated Test: Real Madrid Stun Bayern with Late Drama',
      slug: testSlug,
      excerpt: 'A dramatic late turnaround secures victory in European thriller.',
      content: '## Late Drama in Munich\n\nUnder the lights, an unforgettable performance unfolded.\n\n> "We never stop believing until the final whistle."\n\nFans celebrated wildly as the referee blew for full time.',
      status: 'DRAFT',
      categoryId: categories[0].id,
      authorId: authors[0].id,
      metaTitle: 'Real Madrid Stun Bayern Munich | MyScore24',
      metaDescription: 'Read the complete match report and tactical review.',
    },
  })
  console.log(`✅ Draft article created with ID: ${created.id}`)

  // 4. Test Publishing
  const published = await prisma.article.update({
    where: { id: created.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
  console.log(`✅ Article published successfully. Status: ${published.status}, PublishedAt: ${published.publishedAt}`)

  // 5. Query via getPublishedArticles helper
  console.log('\n--- 4. Testing Public Retrieval & Fallback Logic ---')
  const { getPublishedArticles, getArticleBySlug } = await import('../src/lib/articles')
  const publishedList = await getPublishedArticles()
  const foundInList = publishedList.find((a) => a.slug === testSlug)
  if (!foundInList) {
    throw new Error(`Published article with slug ${testSlug} not found in getPublishedArticles()!`)
  }
  console.log(`✅ Article correctly returned in public published articles list.`)

  const single = await getArticleBySlug(testSlug)
  if (!single.article || single.article.title !== created.title) {
    throw new Error('Single article lookup by slug failed!')
  }
  console.log(`✅ Single article retrieved by slug: "${single.article.title}"`)

  // 6. Test Sitemap logic
  console.log('\n--- 5. Testing Sitemap Generator ---')
  const sitemapFn = (await import('../src/app/sitemap')).default
  const sitemapRoutes = await sitemapFn()
  const hasNewsArticleInSitemap = sitemapRoutes.some((r) => r.url.includes(testSlug))
  if (!hasNewsArticleInSitemap) {
    throw new Error('Published article not found in sitemap output!')
  }
  console.log(`✅ Published article is dynamically included in sitemap.xml`)

  // 7. Cleanup test article
  console.log('\n--- 6. Cleaning Up Test Data ---')
  await prisma.article.delete({ where: { id: created.id } })
  console.log('✅ Test article cleanly removed from database.')

  console.log('\n🎉 ALL CMS VERIFICATION TESTS PASSED SUCCESSFULLY!\n')
}

testCMS()
  .catch((err) => {
    console.error('❌ Test failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
