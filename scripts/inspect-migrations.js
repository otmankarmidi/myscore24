const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const rows = await prisma.$queryRawUnsafe('SELECT id, migration_name, finished_at, rolled_back_at FROM _prisma_migrations;')
    console.log('Migrations in DB:', JSON.stringify(rows, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
