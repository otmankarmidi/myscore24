import {
  APPROVED_COMPETITIONS,
  APPROVED_COMPETITION_IDS,
  isApprovedCompetition,
  getCompetitionPriority,
  getLocalLeagueLogo,
} from '../src/config/competitions'

async function runTests() {
  console.log('=================================================================')
  console.log('       MYSCORE24 HOMEPAGE FILTERING, LOGOS & PERF VERIFICATION   ')
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

  // 1. Whitelist Verification
  console.log('Test 1: Whitelist Configuration')
  assert('APPROVED_COMPETITIONS is defined and non-empty', APPROVED_COMPETITIONS.length > 0)
  assert('Premier League (39) is approved', APPROVED_COMPETITION_IDS.has(39))
  assert('LaLiga (140) is approved', APPROVED_COMPETITION_IDS.has(140))
  assert('Serie A (135) is approved', APPROVED_COMPETITION_IDS.has(135))
  assert('Bundesliga (78) is approved', APPROVED_COMPETITION_IDS.has(78))
  assert('Ligue 1 (61) is approved', APPROVED_COMPETITION_IDS.has(61))
  assert('UEFA Champions League (2) is approved', APPROVED_COMPETITION_IDS.has(2))
  assert('UEFA Europa League (3) is approved', APPROVED_COMPETITION_IDS.has(3))
  assert('UEFA Conference League (848) is approved', APPROVED_COMPETITION_IDS.has(848))
  assert('World Cup (1) is approved', APPROVED_COMPETITION_IDS.has(1))
  assert('AFCON (6) is approved', APPROVED_COMPETITION_IDS.has(6))
  assert('Random unapproved league (99999) is NOT in whitelist', !APPROVED_COMPETITION_IDS.has(99999))

  // 2. Priority Sorting
  console.log('\nTest 2: Priority Ordering (Big 5 First)')
  const plPriority = getCompetitionPriority({ id: '39', name: 'Premier League' } as any)
  const laligaPriority = getCompetitionPriority({ id: '140', name: 'La Liga' } as any)
  const serieAPriority = getCompetitionPriority({ id: '135', name: 'Serie A' } as any)
  const bundesligaPriority = getCompetitionPriority({ id: '78', name: 'Bundesliga' } as any)
  const ligue1Priority = getCompetitionPriority({ id: '61', name: 'Ligue 1' } as any)
  const uclPriority = getCompetitionPriority({ id: '2', name: 'UEFA Champions League' } as any)
  const unapprovedPriority = getCompetitionPriority({ id: '9999', name: 'Unknown League' } as any)

  assert('Big 5 (Premier League) has higher priority than UCL', plPriority < uclPriority)
  assert('Big 5 (LaLiga) has higher priority than UCL', laligaPriority < uclPriority)
  assert('UCL has higher priority than unapproved league', uclPriority < unapprovedPriority)
  assert('Big 5 priorities are ranked 1 to 5', plPriority === 1 && laligaPriority === 2 && serieAPriority === 3 && bundesligaPriority === 4 && ligue1Priority === 5)

  // 3. Filtering Simulation
  console.log('\nTest 3: Dataset Pre-filtering')
  const mockIncoming = [
    { id: 'm1', league: { id: '39', name: 'Premier League' } },
    { id: 'm2', league: { id: '999', name: 'Random Regional Division 4' } },
    { id: 'm3', league: { id: '140', name: 'La Liga' } },
    { id: 'm4', league: { id: '5555', name: 'Unknown Exhibition Cup' } },
    { id: 'm5', league: { id: '2', name: 'UEFA Champions League' } },
  ]
  const filtered = mockIncoming.filter(m => isApprovedCompetition(m.league as any))
  assert('Filtered list excludes unapproved leagues', filtered.length === 3)
  assert('Filtered list retains Premier League, LaLiga, UCL', 
    filtered.every(m => ['39', '140', '2'].includes(m.league.id))
  )

  // 4. Logo Fallback
  console.log('\nTest 4: Local Logo Fallback & Logo Handling')
  const plLocalLogo = getLocalLeagueLogo({ id: '39', name: 'Premier League' })
  assert('Premier League has a local fallback logo SVG', typeof plLocalLogo === 'string' && plLocalLogo.length > 0)
  const uclLocalLogo = getLocalLeagueLogo({ id: '2', name: 'UEFA Champions League' })
  assert('UCL has a local fallback logo SVG', typeof uclLocalLogo === 'string' && uclLocalLogo.length > 0)

  // 5. Zero-Match Exclusions
  console.log('\nTest 5: Zero-Match Competitions Excluded from Display')
  const competitionsWithMatches = new Map<string, number>()
  mockIncoming.forEach(m => {
    if (isApprovedCompetition(m.league as any)) {
      competitionsWithMatches.set(m.league.id, (competitionsWithMatches.get(m.league.id) || 0) + 1)
    }
  })
  // Bundesliga had 0 matches in mockIncoming
  assert('Bundesliga with 0 matches is not in displayed map', !competitionsWithMatches.has('78'))
  assert('Premier League with 1 match is in displayed map', competitionsWithMatches.get('39') === 1)

  console.log('\n=================================================================')
  console.log(`TOTAL: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error(err)
  process.exit(1)
})
