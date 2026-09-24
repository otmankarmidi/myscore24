import {
  GA_MEASUREMENT_ID,
  isAnalyticsConsentGranted,
  updateAnalyticsConsent,
  trackMatchOpen,
  trackTeamOpen,
  trackPlayerOpen,
  trackCompetitionOpen,
  trackArticleOpen,
  trackSearch,
  trackFavoriteMatch,
  trackFavoriteTeam,
  trackLanguageChange,
  CONSENT_STORAGE_KEY,
} from '../src/lib/analytics'

async function run() {
  console.log('=================================================================')
  console.log('       MYSCORE24 GOOGLE ANALYTICS 4 (GA4) INTEGRATION TEST       ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(desc: string, cond: boolean) {
    if (cond) {
      console.log(`  ✅ [PASS] ${desc}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${desc}`)
      failed++
    }
  }

  // 1. Measurement ID Check
  console.log('Test 1: Measurement ID Verification')
  assert('Measurement ID is G-L96Q86DFG3', GA_MEASUREMENT_ID === 'G-L96Q86DFG3')

  // 2. Mock Window & DataLayer Setup
  console.log('\nTest 2: GA4 DataLayer & Event Dispatch Verification')
  const dispatchedEvents: any[] = []
  const mockWindow: any = {
    dataLayer: [],
    gtag: function(...args: any[]) {
      mockWindow.dataLayer.push(args)
      if (args[0] === 'event') {
        dispatchedEvents.push({ action: args[1], params: args[2] })
      }
    },
    localStorage: {
      items: {} as Record<string, string>,
      getItem(key: string) { return this.items[key] || null },
      setItem(key: string, val: string) { this.items[key] = val }
    }
  }
  // Inject mock window globally for testing
  ;(global as any).window = mockWindow
  ;(global as any).localStorage = mockWindow.localStorage

  // Test match_open
  trackMatchOpen({
    matchId: '1637928',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    competition: 'Premier League',
    status: 'scheduled'
  })
  const matchEvent = dispatchedEvents.find(e => e.action === 'match_open')
  assert('match_open event dispatched', Boolean(matchEvent))
  assert('match_open contains match_id', matchEvent?.params?.match_id === '1637928')
  assert('match_open contains home_team and away_team', matchEvent?.params?.home_team === 'Arsenal' && matchEvent?.params?.away_team === 'Chelsea')

  // Test team_open
  trackTeamOpen({
    teamId: '42',
    teamName: 'Arsenal',
    country: 'England'
  })
  const teamEvent = dispatchedEvents.find(e => e.action === 'team_open')
  assert('team_open event dispatched', Boolean(teamEvent))
  assert('team_open contains team_id and team_name', teamEvent?.params?.team_id === '42' && teamEvent?.params?.team_name === 'Arsenal')

  // Test player_open
  trackPlayerOpen({
    playerId: '1467',
    playerName: 'Bukayo Saka',
    teamName: 'Arsenal',
    position: 'Attacker'
  })
  const playerEvent = dispatchedEvents.find(e => e.action === 'player_open')
  assert('player_open event dispatched', Boolean(playerEvent))
  assert('player_open contains player_id and name', playerEvent?.params?.player_id === '1467' && playerEvent?.params?.player_name === 'Bukayo Saka')

  // Test competition_open
  trackCompetitionOpen({
    competitionId: '39',
    competitionName: 'Premier League',
    country: 'England'
  })
  const compEvent = dispatchedEvents.find(e => e.action === 'competition_open')
  assert('competition_open event dispatched', Boolean(compEvent))
  assert('competition_open contains competition_id and name', compEvent?.params?.competition_id === '39' && compEvent?.params?.competition_name === 'Premier League')

  // Test article_open
  trackArticleOpen({
    articleId: 'art-1',
    articleTitle: 'Title of the Match',
    category: 'tactics'
  })
  const articleEvent = dispatchedEvents.find(e => e.action === 'article_open')
  assert('article_open event dispatched', Boolean(articleEvent))

  // Test search
  trackSearch('Arsenal', 15)
  const searchEvent = dispatchedEvents.find(e => e.action === 'search')
  assert('search event dispatched', Boolean(searchEvent))
  assert('search contains search_term and results_count', searchEvent?.params?.search_term === 'Arsenal' && searchEvent?.params?.results_count === 15)

  // Test favorite_match
  trackFavoriteMatch('1637928', true)
  const favMatchEvent = dispatchedEvents.find(e => e.action === 'favorite_match')
  assert('favorite_match event dispatched', Boolean(favMatchEvent))
  assert('favorite_match action is add', favMatchEvent?.params?.action === 'add')

  // Test favorite_team
  trackFavoriteTeam('42', true)
  const favTeamEvent = dispatchedEvents.find(e => e.action === 'favorite_team')
  assert('favorite_team event dispatched', Boolean(favTeamEvent))

  // Test language_change
  trackLanguageChange('fr')
  const langEvent = dispatchedEvents.find(e => e.action === 'language_change')
  assert('language_change event dispatched', Boolean(langEvent))
  assert('language_change locale is fr', langEvent?.params?.locale === 'fr')

  // 3. Consent Management
  console.log('\nTest 3: Cookie Consent Verification')
  assert('Default consent is granted without explicit denial', isAnalyticsConsentGranted() === true)

  updateAnalyticsConsent(false)
  assert('Denying consent sets consent to denied', isAnalyticsConsentGranted() === false)

  // Dispatched events while denied should NOT fire
  const beforeCount = dispatchedEvents.length
  trackSearch('DeniedSearch')
  assert('Events are suppressed when consent is denied', dispatchedEvents.length === beforeCount)

  updateAnalyticsConsent(true)
  assert('Re-granting consent enables event tracking', isAnalyticsConsentGranted() === true)

  console.log('\n=================================================================')
  console.log(`TOTAL: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================')

  if (failed > 0) process.exit(1)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
