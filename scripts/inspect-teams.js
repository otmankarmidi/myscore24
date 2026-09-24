const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const teams = await prisma.team.findMany({ take: 5 })
    console.log('Sample teams in DB:', teams)
    const count = await prisma.team.count()
    console.log('Total teams in DB:', count)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
