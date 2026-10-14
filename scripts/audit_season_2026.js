const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const currentSeason = await prisma.season.findFirst({
      where: { competition: { providerId: 39 }, current: true }
    });
    console.log('Current PL Season in DB:', currentSeason);

    const matches2026 = await prisma.match.count({
      where: { competition: { providerId: 39 }, season: { year: 2026 } }
    });
    console.log('Matches in season 2026:', matches2026);

    // Group matches by round for season 2026
    const rounds = await prisma.match.groupBy({
      by: ['round', 'status'],
      where: { competition: { providerId: 39 }, season: { year: 2026 } },
      _count: { _all: true }
    });
    console.log('Rounds & match status in season 2026:', rounds);

    // Check Premier League teams in 2026
    const plTeams = await prisma.team.findMany({
      where: {
        homeMatches: { some: { competition: { providerId: 39 }, season: { year: 2026 } } }
      },
      select: { id: true, providerId: true, name: true, logo: true }
    });
    console.log(`Found ${plTeams.length} PL Teams in season 2026:`, plTeams.map(t => t.name));

    // Check players belonging to these teams
    const playersInPLTeams = await prisma.player.count({
      where: { currentClubId: { in: plTeams.map(t => t.id) } }
    });
    console.log(`Players in currentClub of PL teams: ${playersInPLTeams}`);

    // Check how many players have stats in PL 2026
    const pl2026Stats = await prisma.playerSeasonStatistic.count({
      where: { providerLeagueId: 39, season: 2026 }
    });
    console.log(`PlayerSeasonStatistic records for PL 2026: ${pl2026Stats}`);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
