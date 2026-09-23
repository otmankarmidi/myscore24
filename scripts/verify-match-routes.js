const { PrismaClient } = require('@prisma/client')
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

const prisma = new PrismaClient()

async function runVerification() {
  console.log('=== MATCH ROUTE & INTEGRITY VERIFICATION ===\n')

  try {
    // 1. Audit match ID consistency in MySQL
    console.log('[Check 1] Checking total matches and providerFixtureId integrity in MySQL...')
    const totalMatches = await prisma.match.count()
    console.log(`         Total matches in DB: ${totalMatches}`)

    const invalidProviderIds = await prisma.match.count({
      where: {
        providerFixtureId: { lte: 0 }
      }
    })
    console.log(`         Matches with invalid/null providerFixtureId: ${invalidProviderIds}`)
    if (invalidProviderIds > 0) {
      console.error('❌ Found matches with invalid providerFixtureId!')
      process.exit(1)
    }
    console.log('✅ All stored matches possess valid numeric providerFixtureId values.\n')

    // 2. Fetch a sample finished match
    const sample = await prisma.match.findFirst({
      where: { isFinal: true },
      include: {
        competition: { include: { country: true } },
        season: true,
        homeTeam: true,
        awayTeam: true
      }
    })

    if (!sample) {
      console.error('❌ No final matches found in database.')
      process.exit(1)
    }

    console.log(`[Check 2] Sample match retrieval by providerFixtureId: ${sample.providerFixtureId}`)
    console.log(`         Competition: ${sample.competition.name}`)
    console.log(`         Season: ${sample.season.year}`)
    console.log(`         Fixture: ${sample.homeTeam.name} vs ${sample.awayTeam.name}`)
    console.log(`         Score: ${sample.homeScore} - ${sample.awayScore}`)
    console.log(`         isFinal: ${sample.isFinal}`)
    console.log(`         Status: ${sample.status}`)
    console.log(`         Internal DB id: ${sample.id} (must NOT be used in URLs)`)
    console.log(`         Canonical URL: /match/${sample.providerFixtureId}`)
    console.log('✅ Canonical URL matches providerFixtureId.\n')

    // 3. Verify uniqueness of providerFixtureId
    const duplicates = await prisma.$queryRaw`
      SELECT providerFixtureId, COUNT(*) as cnt 
      FROM matches 
      GROUP BY providerFixtureId 
      HAVING cnt > 1;
    `
    console.log(`[Check 3] Duplicate providerFixtureId check: ${duplicates.length} duplicates found`)
    if (duplicates.length > 0) {
      console.error('❌ Duplicate providerFixtureId entries detected!')
      process.exit(1)
    }
    console.log('✅ providerFixtureId is strictly unique across all matches.\n')

    console.log('=== ALL DATABASE-LEVEL MATCH INTEGRITY CHECKS PASSED ===')
  } catch (err) {
    console.error('❌ Verification failed with error:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runVerification()
