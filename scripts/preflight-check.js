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

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function preflight() {
  console.log('--- PREFLIGHT CHECK ---')
  const matchCount = await prisma.match.count({
    where: {
      competition: { providerId: 39 },
      season: { year: 2025 },
    },
  })
  const teamCount = await prisma.team.count()
  console.log('League 39 Season 2025 matches in MySQL:', matchCount)
  console.log('Total teams in MySQL:', teamCount)
  await prisma.$disconnect()
}

preflight()
