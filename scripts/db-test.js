const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local or .env if not loaded
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

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ Database connection test failed: DATABASE_URL is not set in environment or .env.local.')
      process.exit(1)
    }

    // Execute minimal safe query: SELECT 1
    await prisma.$queryRaw`SELECT 1 as connected;`
    console.log('✅ Database connection test succeeded! Successfully connected to MySQL via Prisma.')
  } catch (err) {
    console.error('❌ Database connection test failed.')
    if (err.code) {
      console.error(`Error Code: ${err.code}`)
    }
    // Sanitize error message to prevent credential or full URL exposure
    const rawMsg = err.message || 'Unknown database error'
    const sanitizedMessage = rawMsg
      .replace(/mysql:\/\/[^@]+@/g, 'mysql://****:****@')
      .replace(/:[^:@/]+@/g, ':****@')
    console.error(`Reason: ${sanitizedMessage}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
