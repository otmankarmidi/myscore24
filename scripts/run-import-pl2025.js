const fs = require('fs')
const path = require('path')

// Load environment variables
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

async function run() {
  const { syncCompetitionSeason } = await import('../src/lib/football/persistence/importer.ts')
  const { prisma } = await import('../src/lib/prisma.ts')

  console.log('🚀 Starting syncCompetitionSeason for Premier League (39) Season 2025...')
  const result = await syncCompetitionSeason({
    leagueProviderId: 39,
    seasonYear: 2025,
  })

  console.log('--- IMPORT RESULT ---')
  console.log(JSON.stringify(result, null, 2))

  // Direct database verification
  console.log('\n--- VERIFYING MYSQL DATABASE ---')
  const comp = await prisma.competition.findUnique({
    where: { providerId: 39 },
    include: { country: true },
  })
  console.log('Competition in DB:', comp?.name, `(ID: ${comp?.providerId})`, 'Country:', comp?.country?.name)

  const season = await prisma.season.findFirst({
    where: { competitionId: comp.id, year: 2025 },
  })
  console.log('Season in DB:', season?.year, `(ID: ${season?.id})`)

  const matches = await prisma.match.findMany({
    where: { competitionId: comp.id, seasonId: season.id },
    include: { homeTeam: true, awayTeam: true },
  })
  console.log('Total matches in DB for Premier League 2025:', matches.length)

  const finalMatches = matches.filter((m) => m.isFinal)
  console.log('Matches with isFinal=true:', finalMatches.length)

  // Verify unique providerFixtureId values
  const fixtureIds = new Set(matches.map((m) => m.providerFixtureId))
  console.log('Unique providerFixtureId count:', fixtureIds.size, 'Matches count:', matches.length)
  console.log('No duplicates check:', fixtureIds.size === matches.length ? 'PASS ✅' : 'FAIL ❌')

  const teams = await prisma.team.findMany()
  console.log('Total teams stored in DB:', teams.length)

  // Pick a sample finished match to inspect
  if (finalMatches.length > 0) {
    const sample = finalMatches[0]
    console.log(`Sample Finished Match: ${sample.homeTeam.name} ${sample.homeScore} - ${sample.awayScore} ${sample.awayTeam.name} (${sample.status}) [isFinal: ${sample.isFinal}, Kickoff: ${sample.kickoff.toISOString()}]`)
    console.log(`Sample providerFixtureId: ${sample.providerFixtureId}`)
  }

  // Inspect ImportJob record
  const job = await prisma.importJob.findUnique({
    where: { id: result.jobId },
  })
  console.log('\n--- IMPORT JOB RECORD ---')
  console.log(JSON.stringify(job, null, 2))

  await prisma.$disconnect()
}

run().catch((e) => {
  console.error('Execution failed:', e)
  process.exit(1)
})
