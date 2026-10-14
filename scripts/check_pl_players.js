const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.player.count();
  console.log('Total players in DB:', count);

  const statsCount = await prisma.playerSeasonStatistic.count();
  console.log('Total player_season_statistics in DB:', statsCount);

  const plStats = await prisma.playerSeasonStatistic.findMany({
    where: { providerLeagueId: 39 },
    take: 10,
    include: { player: true }
  });
  console.log('Sample PL stats count:', plStats.length);
  plStats.forEach(s => {
    console.log(`${s.player.name} | ${s.teamName} | Season ${s.season} | Pos: ${s.position} | Goals: ${s.goals} | Apps: ${s.appearances}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
