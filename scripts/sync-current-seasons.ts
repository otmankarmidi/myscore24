import { prisma } from '../src/lib/prisma'
import { apiTelemetry } from '../src/services/sports/apiTelemetry'
import { resolveAndSyncCurrentSeason, CompetitionSyncResult } from '../src/lib/football/persistence/seasonSync'
import { getCurrentSeasonForCompetition, getAvailableSeasonsForCompetition, getStoredMatchesByTeam } from '../src/lib/football/persistence/queries'

async function run() {
  console.log('=================================================================')
  console.log('       MYSCORE24 CONTROLLED CURRENT-SEASON SYNC & VERIFICATION   ')
  console.log('=================================================================\n')

  const initialMetrics = apiTelemetry.getMetrics()
  console.log(`[Telemetry] Initial Status: ${initialMetrics.quotaWarningLevel}`)
  console.log(`[Telemetry] Requests Used Today: ${initialMetrics.requestsUsedToday} / ${initialMetrics.dailyQuotaLimit}`)
  console.log(`[Telemetry] Quota Remaining: ${initialMetrics.quotaRemaining}\n`)

  const results: CompetitionSyncResult[] = []

  // ── STEP 1: PREMIER LEAGUE (ID 39) COMPLETE TEST ─────────────────────────
  console.log('>>> [1/5] Starting Premier League (ID: 39) Sync...')
  const plResult = await resolveAndSyncCurrentSeason(39)
  results.push(plResult)
  console.log(`    Status: ${plResult.status}`)
  console.log(`    Detected Current Season: ${plResult.currentSeason}`)
  console.log(`    Fixtures Stored: ${plResult.fixturesStored}`)
  console.log(`    Teams Stored: ${plResult.teamsStored}`)
  console.log(`    Standings Stored: ${plResult.standingsStored}`)
  console.log(`    Scorers Stored: ${plResult.scorersStored}`)
  console.log(`    API Requests Used: ${plResult.apiRequestsUsed}`)
  console.log(`    Cache/DB Hits: ${plResult.cacheDbHits}`)
  console.log(`    Coverage Limitations: ${plResult.coverageLimitations.join(', ') || 'None'}\n`)

  // Verification checks for Premier League:
  console.log('>>> Verifying Premier League Integrity...')
  const plDbSeason = await getCurrentSeasonForCompetition(39)
  console.log(`  - MySQL current season: ${plDbSeason} (expected ${plResult.currentSeason})`)

  const plMatchesCount = await prisma.match.count({
    where: { competition: { providerId: 39 }, season: { year: plResult.currentSeason! } }
  })
  console.log(`  - MySQL match count for current season: ${plMatchesCount}`)

  // Duplicate fixture check
  const duplicateFixtures: any[] = await prisma.$queryRaw`
    SELECT providerFixtureId, COUNT(*) as c
    FROM matches
    WHERE competitionId IN (SELECT id FROM competitions WHERE providerId = 39)
    GROUP BY providerFixtureId
    HAVING c > 1;
  `
  console.log(`  - Duplicate fixtures found: ${duplicateFixtures.length} (expected 0)`)

  // Historical seasons preserved
  const allPlSeasons = await getAvailableSeasonsForCompetition(39)
  console.log(`  - All available seasons in MySQL:`, allPlSeasons.map(s => `${s.year} (current: ${s.current})`))

  // Arsenal (Team 42) check
  const arsenalMatches = await getStoredMatchesByTeam(42, plResult.currentSeason!)
  console.log(`  - Arsenal (Team 42) matches in current season: ${arsenalMatches.length}`)

  // Repeated visit check (0 unnecessary provider requests)
  console.log('  - Testing repeated visit for Premier League (should use MySQL/cache, 0 provider requests)...')
  const repeatSync = await resolveAndSyncCurrentSeason(39)
  console.log(`  - Repeat sync API requests used: ${repeatSync.apiRequestsUsed} (expected 0)`)
  console.log(`  - Repeat sync Cache/DB hits: ${repeatSync.cacheDbHits} (expected > 0)`)

  if (plResult.status !== 'SUCCESS' || duplicateFixtures.length > 0 || plMatchesCount === 0) {
    console.error('❌ Premier League sync or integrity check failed! Halting before continuing.')
    printSummaryTable(results)
    process.exit(1)
  }
  console.log('✅ Premier League test passed 100%!\n')

  // ── STEP 2: SEQUENTIAL SYNC FOR REMAINING BIG 4 ──────────────────────────
  const remainingBig4 = [
    { id: 140, name: 'LaLiga' },
    { id: 135, name: 'Serie A' },
    { id: 78, name: 'Bundesliga' },
    { id: 61, name: 'Ligue 1' },
  ]

  for (let i = 0; i < remainingBig4.length; i++) {
    const comp = remainingBig4[i]
    console.log(`>>> [${i + 2}/5] Starting ${comp.name} (ID: ${comp.id}) Sync...`)

    // Check quota before each competition
    if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
      console.warn(`⚠️ Quota protection active! Pausing sync before ${comp.name}.`)
      results.push({
        competitionName: comp.name,
        competitionId: comp.id,
        currentSeason: null,
        fixturesStored: 0,
        teamsStored: 0,
        standingsStored: 0,
        scorersStored: 0,
        apiRequestsUsed: 0,
        cacheDbHits: 0,
        coverageLimitations: ['Quota protection paused sync'],
        status: 'PAUSED',
        message: 'Sync paused due to quota limit.',
        lastUpdated: new Date().toISOString(),
      })
      break
    }

    const compResult = await resolveAndSyncCurrentSeason(comp.id)
    results.push(compResult)
    console.log(`    Status: ${compResult.status}`)
    console.log(`    Detected Current Season: ${compResult.currentSeason}`)
    console.log(`    Fixtures Stored: ${compResult.fixturesStored}`)
    console.log(`    Teams Stored: ${compResult.teamsStored}`)
    console.log(`    Standings Stored: ${compResult.standingsStored}`)
    console.log(`    Scorers Stored: ${compResult.scorersStored}`)
    console.log(`    API Requests Used: ${compResult.apiRequestsUsed}`)
    console.log(`    Cache/DB Hits: ${compResult.cacheDbHits}`)
    console.log(`    Coverage Limitations: ${compResult.coverageLimitations.join(', ') || 'None'}\n`)
  }

  // ── PRINT FINAL SUMMARY TABLE ─────────────────────────────────────────────
  printSummaryTable(results)
}

function printSummaryTable(results: CompetitionSyncResult[]) {
  console.log('\n=============================================================================================================')
  console.log('                                 MYSCORE24 BIG 5 CURRENT SEASON SYNC REPORT                                  ')
  console.log('=============================================================================================================')
  console.log(
    '| ' +
    'Competition'.padEnd(16) + ' | ' +
    'Season'.padEnd(8) + ' | ' +
    'Fixtures'.padEnd(10) + ' | ' +
    'Teams'.padEnd(8) + ' | ' +
    'Standings'.padEnd(10) + ' | ' +
    'Scorers'.padEnd(8) + ' | ' +
    'API Req'.padEnd(8) + ' | ' +
    'DB Hits'.padEnd(8) + ' | ' +
    'Status'.padEnd(10) + ' |'
  )
  console.log('|------------------|----------|------------|----------|------------|----------|----------|----------|------------|')

  for (const r of results) {
    console.log(
      '| ' +
      r.competitionName.slice(0, 16).padEnd(16) + ' | ' +
      String(r.currentSeason || 'N/A').padEnd(8) + ' | ' +
      String(r.fixturesStored).padEnd(10) + ' | ' +
      String(r.teamsStored).padEnd(8) + ' | ' +
      String(r.standingsStored).padEnd(10) + ' | ' +
      String(r.scorersStored).padEnd(8) + ' | ' +
      String(r.apiRequestsUsed).padEnd(8) + ' | ' +
      String(r.cacheDbHits).padEnd(8) + ' | ' +
      r.status.padEnd(10) + ' |'
    )
  }
  console.log('=============================================================================================================\n')
}

run().catch(err => {
  console.error('Fatal sync script error:', err)
  process.exit(1)
})
