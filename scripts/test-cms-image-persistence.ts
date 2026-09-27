import { prisma } from '../src/lib/prisma'
import { saveUploadedFile, getUploadedFile, PUBLIC_UPLOADS_DIR, getPersistentStorageDir } from '../src/lib/storage'
import { getPublishedArticles, getArticleBySlug } from '../src/lib/articles'
import { normalizeArticleImageUrl, getArticleOgImageUrl } from '../src/lib/newsImage'
import fs from 'fs'
import path from 'path'

async function runTests() {
  console.log('=== TEST 1: Trace "Norway 1-2 Portugal: Goals & Highlights | UEFA Nations League" ===')
  const norwayArticle = await prisma.article.findFirst({
    where: { title: { contains: 'Norway 1-2 Portugal' } }
  })
  console.log('1. MySQL Article record:')
  console.log('   ID:', norwayArticle?.id)
  console.log('   Slug:', norwayArticle?.slug)
  console.log('   Title:', norwayArticle?.title)
  console.log('   featuredImage:', norwayArticle?.featuredImage)
  
  if (norwayArticle?.featuredImage) {
    const filename = path.basename(norwayArticle.featuredImage)
    const publicPath = path.join(PUBLIC_UPLOADS_DIR, filename)
    console.log('2. Physical file check:')
    console.log('   Checked path:', publicPath)
    console.log('   Physical file exists locally:', fs.existsSync(publicPath) ? 'YES' : 'NO')
    
    // Test on live server
    try {
      const liveRes = await fetch('https://www.myscore24.com' + norwayArticle.featuredImage)
      console.log('   HTTP response on live server:', liveRes.status, liveRes.statusText)
    } catch (e: any) {
      console.log('   HTTP response error:', e.message)
    }
  }

  console.log('\n=== TEST 2: Trace "Erling Haaland Goal vs Portugal Levels Norway 1-1 – VIDEO" ===')
  const haalandArticle = await prisma.article.findFirst({
    where: { title: { contains: 'Erling Haaland Goal vs Portugal' } }
  })
  console.log('1. MySQL Article record:')
  console.log('   ID:', haalandArticle?.id)
  console.log('   Slug:', haalandArticle?.slug)
  console.log('   Title:', haalandArticle?.title)
  console.log('   featuredImage:', haalandArticle?.featuredImage)
  if (haalandArticle?.featuredImage) {
    const filename = path.basename(haalandArticle.featuredImage)
    const publicPath = path.join(PUBLIC_UPLOADS_DIR, filename)
    console.log('2. Physical file check:')
    console.log('   Checked path:', publicPath)
    console.log('   Physical file exists locally:', fs.existsSync(publicPath) ? 'YES' : 'NO')
    try {
      const liveRes = await fetch('https://www.myscore24.com' + haalandArticle.featuredImage)
      console.log('   HTTP response on live server:', liveRes.status, liveRes.statusText)
    } catch (e: any) {
      console.log('   HTTP response error:', e.message)
    }
  }

  console.log('\n=== TEST 3: Trace "Belgium vs France: Zidane Faces Major Test Without Mbappé" ===')
  const belgiumArticle = await prisma.article.findFirst({
    where: { title: { contains: 'Belgium vs France' } }
  })
  console.log('1. MySQL Article record:')
  console.log('   ID:', belgiumArticle?.id)
  console.log('   Slug:', belgiumArticle?.slug)
  console.log('   featuredImage:', belgiumArticle?.featuredImage)
  if (belgiumArticle?.featuredImage) {
    const filename = path.basename(belgiumArticle.featuredImage)
    const publicPath = path.join(PUBLIC_UPLOADS_DIR, filename)
    console.log('2. Physical file check:')
    console.log('   Checked path:', publicPath)
    console.log('   Physical file exists locally:', fs.existsSync(publicPath) ? 'YES' : 'NO')
    try {
      const liveRes = await fetch('https://www.myscore24.com' + belgiumArticle.featuredImage)
      console.log('   HTTP response on live server:', liveRes.status, liveRes.statusText)
    } catch (e: any) {
      console.log('   HTTP response error:', e.message)
    }
  }

  console.log('\n=== TEST 4: End-to-End CMS Image Persistence & Recovery Test ===')
  // Create a 1x1 valid test PNG
  const testPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  )
  const testFilename = `cms-persistence-test-${Date.now()}.png`
  
  console.log('1. Saving test image to persistent storage and public uploads...')
  await saveUploadedFile(testFilename, testPngBuffer)

  const persistentDir = getPersistentStorageDir()
  console.log('   Persistent storage dir:', persistentDir)
  console.log('   Public uploads dir:', PUBLIC_UPLOADS_DIR)
  console.log('   File exists in persistent dir:', fs.existsSync(path.join(persistentDir, testFilename)) ? 'YES' : 'NO')
  console.log('   File exists in public uploads dir:', fs.existsSync(path.join(PUBLIC_UPLOADS_DIR, testFilename)) ? 'YES' : 'NO')

  console.log('\n2. Creating test article in MySQL...')
  const testSlug = `test-persistence-${Date.now()}`
  const createdArticle = await prisma.article.create({
    data: {
      title: 'CMS Image Persistence Verification Test',
      slug: testSlug,
      excerpt: 'Verifying persistent storage survives builds, restarts, and deployments.',
      content: 'This is an automated verification test for image persistence.',
      featuredImage: `/uploads/news/${testFilename}`,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    }
  })
  console.log('   Created article ID:', createdArticle.id)
  console.log('   Stored featuredImage:', createdArticle.featuredImage)

  console.log('\n3. Verifying retrieval via getArticleBySlug and normalization helpers...')
  const { article: retrieved } = await getArticleBySlug(testSlug)
  console.log('   Retrieved article title:', retrieved?.title)
  console.log('   Retrieved article imageUrl:', retrieved?.imageUrl)
  console.log('   Normalized imageUrl:', normalizeArticleImageUrl(retrieved?.imageUrl))
  console.log('   SEO Absolute OG URL:', getArticleOgImageUrl(retrieved?.imageUrl))

  console.log('\n4. Simulating deployment wipe (deleting file from public/uploads/news/)...')
  const publicTestPath = path.join(PUBLIC_UPLOADS_DIR, testFilename)
  if (fs.existsSync(publicTestPath)) {
    fs.unlinkSync(publicTestPath)
  }
  console.log('   Public copy exists after simulated deploy wipe:', fs.existsSync(publicTestPath) ? 'YES' : 'NO')
  console.log('   Persistent copy still exists:', fs.existsSync(path.join(persistentDir, testFilename)) ? 'YES' : 'NO')

  console.log('\n5. Testing automatic self-healing recovery via getUploadedFile...')
  const recovered = getUploadedFile(testFilename)
  console.log('   Recovered from persistent storage:', recovered ? 'YES' : 'NO')
  console.log('   Recovered content type:', recovered?.contentType)
  console.log('   Recovered buffer length:', recovered?.buffer.length)
  console.log('   Public copy automatically restored:', fs.existsSync(publicTestPath) ? 'YES' : 'NO')

  console.log('\n6. Cleaning up test article in MySQL...')
  await prisma.article.delete({ where: { id: createdArticle.id } })
  console.log('   Test article deleted from MySQL.')
}

runTests().catch(console.error).finally(() => prisma.$disconnect())
