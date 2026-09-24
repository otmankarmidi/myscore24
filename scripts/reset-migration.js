const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Cleaning up failed migration record...')
    await prisma.$executeRawUnsafe(`DELETE FROM _prisma_migrations WHERE migration_name = '20260925000000_add_players_and_player_stats';`)
    console.log('Dropping players table if exists...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS player_season_statistics;`)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS players;`)
    console.log('Cleanup successful.')
  } catch (e) {
    console.error('Error during cleanup:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
