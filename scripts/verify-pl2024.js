const fs = require('fs')
const path = require('path')

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

async function verify() {
  console.log('=== VERIFYING PREMIER LEAGUE 2024 IN MYSQL ===')
  const matches = await prisma.match.findMany({
    where: {
      competition: { providerId: 39 },
      season: { year: 2024 },
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  })

  console.log('Total matches stored:', matches.length)

  const finalMatches = matches.filter((m) => m.isFinal)
  console.log('Matches with isFinal = true:', finalMatches.length)

  // Verify unique providerFixtureId values
  const fixtureIds = new Set(matches.map((m) => m.providerFixtureId))
  console.log('Unique fixture IDs count:', fixtureIds.size)
  console.log('Duplicate check passed:', fixtureIds.size === matches.length)

  // Teams verification
  const teamIds = new Set()
  matches.forEach((m) => {
    teamIds.add(m.homeTeam.name)
    teamIds.add(m.awayTeam.name)
  })
  console.log('Unique teams participating in 2024 season:', teamIds.size)
  console.log('Sample teams:', Array.from(teamIds).slice(0, 5).join(', '))

  // Sample scores inspection
  const sample = matches[0]
  console.log('Sample Match:', `${sample.homeTeam.name} ${sample.homeScore} - ${sample.awayScore} ${sample.awayTeam.name} (${sample.status}) [isFinal: ${sample.isFinal}, ID: ${sample.providerFixtureId}]`)

  await prisma.$disconnect()
}

verify()
