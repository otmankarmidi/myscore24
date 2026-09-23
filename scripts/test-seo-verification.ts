import robots from '../src/app/robots'
import sitemap from '../src/app/sitemap'

async function runSeoTests() {
  console.log('\n=================================================================')
  console.log('       MYSCORE24 STEP 3 — TECHNICAL SEO VALIDATION SUITE        ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  // 1. Test Robots.txt
  console.log('Test 1: robots.txt structure & rules')
  const robotsConfig = robots()
  const rule = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules
  assert(rule.allow === '/', 'Robots allows public root crawling')
  const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
  assert(disallows.includes('/admin/') && disallows.includes('/api/'), 'Robots disallows /admin/ and /api/')
  assert(robotsConfig.sitemap === 'https://myscore24.com/sitemap.xml', 'Robots references https://myscore24.com/sitemap.xml')

  // 2. Test Sitemap.xml
  console.log('\nTest 2: sitemap.xml dynamic generation (0 API-Football calls)')
  const sitemapEntries = await sitemap()
  assert(sitemapEntries.length > 0, `Sitemap generated ${sitemapEntries.length} total entries`)
  
  const urls = sitemapEntries.map((e) => e.url)
  assert(urls.includes('https://myscore24.com'), 'Sitemap includes homepage')
  assert(urls.includes('https://myscore24.com/live'), 'Sitemap includes /live')
  assert(urls.includes('https://myscore24.com/fixtures'), 'Sitemap includes /fixtures')
  assert(urls.includes('https://myscore24.com/results'), 'Sitemap includes /results')
  assert(urls.includes('https://myscore24.com/competitions'), 'Sitemap includes /competitions')
  assert(urls.includes('https://myscore24.com/news'), 'Sitemap includes /news')

  const hasLeague = urls.some((u) => u.startsWith('https://myscore24.com/league/'))
  assert(hasLeague, 'Sitemap includes database competition/league URLs')

  const hasTeam = urls.some((u) => u.startsWith('https://myscore24.com/team/'))
  assert(hasTeam, 'Sitemap includes database team URLs')

  const hasPlayer = urls.some((u) => u.startsWith('https://myscore24.com/player/'))
  assert(hasPlayer, 'Sitemap includes manifest player URLs')

  // 3. Duplicate URLs Check in Sitemap
  console.log('\nTest 3: URL uniqueness in Sitemap')
  const uniqueUrls = new Set(urls)
  assert(uniqueUrls.size === urls.length, `All ${urls.length} sitemap URLs are unique (no duplicate canonicals)`)

  console.log('\n=================================================================')
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================\n')

  process.exit(failed > 0 ? 1 : 0)
}

runSeoTests().catch((e) => {
  console.error(e)
  process.exit(1)
})
