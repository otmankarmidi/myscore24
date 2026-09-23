const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local or .env
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

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Representative sample raw fixture from API-Football
const sampleFixture = {
  fixture: {
    id: 999901,
    referee: 'Clément Turpin',
    timezone: 'UTC',
    date: '2026-09-20T20:00:00+00:00',
    timestamp: 1790020800,
    venue: {
      id: 501,
      name: 'Stamford Bridge',
      city: 'London',
    },
    status: {
      long: 'Match Finished',
      short: 'FT',
      elapsed: 90,
    },
  },
  league: {
    id: 39,
    name: 'Premier League',
    country: 'England',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    season: 2026,
    round: 'Regular Season - 5',
  },
  teams: {
    home: {
      id: 49,
      name: 'Chelsea',
      logo: 'https://media.api-sports.io/football/teams/49.png',
    },
    away: {
      id: 40,
      name: 'Liverpool',
      logo: 'https://media.api-sports.io/football/teams/40.png',
    },
  },
  goals: {
    home: 2,
    away: 1,
  },
  score: {
    halftime: { home: 1, away: 0 },
    fulltime: { home: 2, away: 1 },
    extratime: { home: null, away: null },
    penalty: { home: null, away: null },
  },
}

async function runTest() {
  console.log('🧪 Starting Small Controlled Persistence Test...')

  try {
    // 1. Upsert Country
    const country = await prisma.country.upsert({
      where: { id: 'test-country-england' },
      update: { name: 'England', flag: sampleFixture.league.flag },
      create: { id: 'test-country-england', name: 'England', code: 'EN', flag: sampleFixture.league.flag },
    })
    console.log('✅ Country verified/upserted:', country.name)

    // 2. Upsert Competition
    const competition = await prisma.competition.upsert({
      where: { providerId: sampleFixture.league.id },
      update: { name: sampleFixture.league.name, logo: sampleFixture.league.logo, countryId: country.id },
      create: { providerId: sampleFixture.league.id, name: sampleFixture.league.name, type: 'league', logo: sampleFixture.league.logo, countryId: country.id },
    })
    console.log('✅ Competition verified/upserted:', competition.name, '(ProviderId:', competition.providerId, ')')

    // 3. Upsert Season
    const season = await prisma.season.upsert({
      where: {
        competitionId_year: {
          competitionId: competition.id,
          year: sampleFixture.league.season,
        },
      },
      update: { current: true },
      create: { competitionId: competition.id, year: sampleFixture.league.season, current: true },
    })
    console.log('✅ Season verified/upserted:', season.year)

    // 4. Upsert Teams
    const homeTeam = await prisma.team.upsert({
      where: { providerId: sampleFixture.teams.home.id },
      update: { name: sampleFixture.teams.home.name, logo: sampleFixture.teams.home.logo, venueName: sampleFixture.fixture.venue.name },
      create: { providerId: sampleFixture.teams.home.id, name: sampleFixture.teams.home.name, logo: sampleFixture.teams.home.logo, venueName: sampleFixture.fixture.venue.name },
    })

    const awayTeam = await prisma.team.upsert({
      where: { providerId: sampleFixture.teams.away.id },
      update: { name: sampleFixture.teams.away.name, logo: sampleFixture.teams.away.logo },
      create: { providerId: sampleFixture.teams.away.id, name: sampleFixture.teams.away.name, logo: sampleFixture.teams.away.logo },
    })
    console.log('✅ Teams verified/upserted:', homeTeam.name, 'vs', awayTeam.name)

    // 5. First Sync of Match
    const matchFirst = await prisma.match.upsert({
      where: { providerFixtureId: sampleFixture.fixture.id },
      update: {
        homeScore: sampleFixture.goals.home,
        awayScore: sampleFixture.goals.away,
        status: sampleFixture.fixture.status.short,
        isFinal: true,
      },
      create: {
        providerFixtureId: sampleFixture.fixture.id,
        competitionId: competition.id,
        seasonId: season.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoff: new Date(sampleFixture.fixture.date),
        status: sampleFixture.fixture.status.short,
        statusLong: sampleFixture.fixture.status.long,
        elapsed: sampleFixture.fixture.status.elapsed,
        homeScore: sampleFixture.goals.home,
        awayScore: sampleFixture.goals.away,
        fulltimeHome: sampleFixture.score.fulltime.home,
        fulltimeAway: sampleFixture.score.fulltime.away,
        isFinal: true,
      },
    })
    console.log('✅ Match first sync succeeded. ID:', matchFirst.id, 'isFinal:', matchFirst.isFinal)

    // 6. Test Idempotency: Sync the EXACT same match again
    const matchSecond = await prisma.match.upsert({
      where: { providerFixtureId: sampleFixture.fixture.id },
      update: {
        homeScore: sampleFixture.goals.home,
        awayScore: sampleFixture.goals.away,
        status: sampleFixture.fixture.status.short,
        isFinal: true,
      },
      create: {
        providerFixtureId: sampleFixture.fixture.id,
        competitionId: competition.id,
        seasonId: season.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoff: new Date(sampleFixture.fixture.date),
        status: sampleFixture.fixture.status.short,
        statusLong: sampleFixture.fixture.status.long,
        elapsed: sampleFixture.fixture.status.elapsed,
        homeScore: sampleFixture.goals.home,
        awayScore: sampleFixture.goals.away,
        fulltimeHome: sampleFixture.score.fulltime.home,
        fulltimeAway: sampleFixture.score.fulltime.away,
        isFinal: true,
      },
    })

    // Verify duplicate prevention
    const totalMatchingCount = await prisma.match.count({
      where: { providerFixtureId: sampleFixture.fixture.id },
    })

    if (totalMatchingCount === 1 && matchFirst.id === matchSecond.id) {
      console.log('✅ Duplicate Prevention VERIFIED: Count is exactly 1, same record ID updated without duplication.')
    } else {
      console.error('❌ Duplicate prevention failed! Count:', totalMatchingCount)
      process.exit(1)
    }

    // 7. Test Historical Query Reading
    const retrieved = await prisma.match.findUnique({
      where: { providerFixtureId: sampleFixture.fixture.id },
      include: {
        competition: true,
        homeTeam: true,
        awayTeam: true,
      },
    })
    console.log('✅ Database-First Read VERIFIED:', retrieved.homeTeam.name, retrieved.homeScore, '-', retrieved.awayScore, retrieved.awayTeam.name, `(${retrieved.status})`)

    console.log('\n🎉 ALL PERSISTENCE TESTS PASSED SUCCESSFULLY!')
  } catch (err) {
    console.error('❌ Test failed with error:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runTest()
