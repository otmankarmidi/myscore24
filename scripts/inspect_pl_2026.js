const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const comp = await prisma.competition.findUnique({
    where: { providerId: 39 },
    include: { seasons: { where: { year: 2026 } } }
  });
  console.log('PL Comp:', comp?.id, comp?.name);
  console.log('Season 2026:', comp?.seasons);

  const matches = await prisma.match.findMany({
    where: { competition: { providerId: 39 }, season: { year: 2026 } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: 'asc' }
  });
  console.log('Matches count:', matches.length);
  matches.forEach(m => {
    console.log(`[${m.id}] ${m.round} | ${m.homeTeam.name} vs ${m.awayTeam.name} | ${m.kickoff.toISOString()} | ${m.status} (${m.homeScore}-${m.awayScore})`);
  });

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { homeMatches: { some: { season: { year: 2026 }, competition: { providerId: 39 } } } },
        { awayMatches: { some: { season: { year: 2026 }, competition: { providerId: 39 } } } }
      ]
    }
  });
  console.log('\nUnique PL Teams active in 2026 count:', teams.length);
  teams.forEach(t => console.log(`[${t.id}] providerId: ${t.providerId} | ${t.name} | logo: ${t.logo}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
