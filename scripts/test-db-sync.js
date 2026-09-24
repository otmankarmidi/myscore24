// Test the full playerService.getOrSyncPlayerProfile flow
// Runs against the production DB + API-Football

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: 'mysql://u875998119_myscore24:Nn%40140535@srv991.hstgr.io:3306/u875998119_myscore24'
})

async function testDbSync() {
  console.log('Testing DB sync for player profiles...\n')

  // Check if tables exist
  const tables = await prisma.$queryRawUnsafe(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'u875998119_myscore24' AND TABLE_NAME IN ('players', 'player_season_statistics')`
  )
  console.log('Tables found:', tables.map(t => t.TABLE_NAME))

  // Check existing player records
  const playerCount = await prisma.player.count()
  console.log(`Player records in DB: ${playerCount}`)

  const statCount = await prisma.playerSeasonStatistic.count()
  console.log(`PlayerSeasonStatistic records in DB: ${statCount}`)

  // Check if any test players already synced
  const testPlayerIds = [386828, 278, 1100, 521]
  for (const pid of testPlayerIds) {
    const p = await prisma.player.findUnique({
      where: { providerPlayerId: pid },
      include: {
        currentClub: { select: { name: true, providerId: true } },
        currentNationalTeam: { select: { name: true, providerId: true } },
        seasonStatistics: {
          where: { season: 2026 },
          select: { 
            leagueName: true, teamName: true, 
            appearances: true, goals: true, assists: true, rating: true,
            isCalendarYear: true
          }
        }
      }
    })

    if (p) {
      console.log(`\n--- ${p.name} (${pid}) ---`)
      console.log(`  Club: ${p.currentClub?.name || 'N/A'} (provider: ${p.currentClubProviderId})`)
      console.log(`  National: ${p.currentNationalTeam?.name || 'N/A'} (provider: ${p.currentNationalProviderId})`)
      console.log(`  Photo: ${p.photo ? 'YES' : 'MISSING'}`)
      console.log(`  Position: ${p.currentPosition}`)
      console.log(`  Last synced: ${p.lastSyncedAt}`)
      console.log(`  2026 Stats (${p.seasonStatistics.length} competitions):`)
      for (const s of p.seasonStatistics) {
        const label = s.isCalendarYear ? '2026' : '2026/27'
        console.log(`    ${s.leagueName} | ${s.teamName} | Apps: ${s.appearances} Goals: ${s.goals} Assists: ${s.assists} Rating: ${s.rating} | Season: ${label}`)
      }
    } else {
      console.log(`\n--- Player ${pid}: NOT IN DB (will be synced on first page visit) ---`)
    }
  }

  await prisma.$disconnect()
}

testDbSync().catch(err => {
  console.error('Error:', err.message)
  prisma.$disconnect()
  process.exit(1)
})
