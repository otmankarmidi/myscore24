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

async function main() {
  const jobs = await prisma.importJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  console.log('Recent import jobs in MySQL:', JSON.stringify(jobs, null, 2))
  await prisma.$disconnect()
}

main()
