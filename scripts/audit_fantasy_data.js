const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  try {
    const comp = await prisma.competition.findUnique({ where: { providerId: 39 } });
    console.log('Premier League Competition in DB:', comp);

    const seasons = await prisma.season.findMany({
      where: { competition: { providerId: 39 } },
      orderBy: { year: 'desc' }
    });
    console.log('Seasons in DB for PL:', seasons);

    const matchCount = await prisma.match.count({ where: { competition: { providerId: 39 } } });
    console.log('Match count for PL in DB:', matchCount);

    const currentMatches = await prisma.match.findMany({
      where: { competition: { providerId: 39 } },
      orderBy: { kickoff: 'desc' },
      take: 5,
      select: { providerFixtureId: true, kickoff: true, round: true, status: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, homeScore: true, awayScore: true }
    });
    console.log('Recent PL matches in DB:', currentMatches);

    const rounds = await prisma.match.findMany({
      where: { competition: { providerId: 39 } },
      select: { round: true },
      distinct: ['round'],
      orderBy: { round: 'asc' }
    });
    console.log('PL Rounds found in DB:', rounds.map(r => r.round));

    const totalPlayers = await prisma.player.count();
    console.log('Total players in DB:', totalPlayers);

    const plPlayersWithStats = await prisma.playerSeasonStatistic.count({
      where: { providerLeagueId: 39 }
    });
    console.log('PL player season stats count:', plPlayersWithStats);

    const sampleStats = await prisma.playerSeasonStatistic.findMany({
      where: { providerLeagueId: 39 },
      take: 2,
      include: { player: { select: { name: true, providerPlayerId: true } } }
    });
    console.log('Sample PL stats:', JSON.stringify(sampleStats, null, 2));

  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
