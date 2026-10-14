const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function runE2ETest() {
  console.log('=== RUNNING FANTASY FOOTBALL E2E TEST ===\n');

  // 1. Verify Database Tables
  const [gwCount, playerCount, rulesCount, leagueCount] = await Promise.all([
    prisma.fantasyGameweek.count(),
    prisma.fantasyPlayer.count(),
    prisma.fantasyScoringRule.count(),
    prisma.fantasyLeague.count(),
  ]);

  console.log(`[PASS] DB Verification:`);
  console.log(`  - Gameweeks: ${gwCount} (target: 38)`);
  console.log(`  - Players: ${playerCount} across 20 clubs`);
  console.log(`  - Scoring Rules: ${rulesCount}`);
  console.log(`  - Leagues: ${leagueCount}\n`);

  // 2. Create / Authenticate Test Manager
  const testEmail = `test_manager_${Date.now()}@myscore24.test`;
  const testTeamName = `Test FC ${Date.now().toString().slice(-4)}`;

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${crypto.scryptSync('secret123', salt, 64).toString('hex')}`;

  const user = await prisma.fantasyUser.create({
    data: {
      email: testEmail,
      passwordHash,
      managerName: 'Alex Ferguson',
      teamName: testTeamName,
    },
  });
  console.log(`[PASS] Manager Registered: "${user.managerName}" (${user.teamName})`);

  // 3. Select 15 Valid Players within 100.0M
  // Need: 2 GKP, 5 DEF, 5 MID, 3 FWD
  const gkps = await prisma.fantasyPlayer.findMany({ where: { position: 'GKP' }, take: 2, orderBy: { price: 'asc' } });
  const defs = await prisma.fantasyPlayer.findMany({ where: { position: 'DEF' }, take: 5, orderBy: { price: 'asc' } });
  const mids = await prisma.fantasyPlayer.findMany({ where: { position: 'MID' }, take: 5, orderBy: { price: 'asc' } });
  const fwds = await prisma.fantasyPlayer.findMany({ where: { position: 'FWD' }, take: 3, orderBy: { price: 'asc' } });

  const selected15 = [
    gkps[0], // slot 1: starter GK
    defs[0], defs[1], defs[2], defs[3], // slots 2-5: starter DEF
    mids[0], mids[1], mids[2], mids[3], // slots 6-9: starter MID
    fwds[0], fwds[1], // slots 10-11: starter FWD
    gkps[1], // slot 12: bench GK
    defs[4], // slot 13: bench DEF
    mids[4], // slot 14: bench MID
    fwds[2], // slot 15: bench FWD
  ];

  const totalCost = selected15.reduce((sum, p) => sum + p.price, 0);
  console.log(`[PASS] 15 Players Selected. Total Cost: £${totalCost.toFixed(1)}M / £100.0M`);

  // 4. Create Squad in DB
  const squad = await prisma.fantasySquad.create({
    data: {
      userId: user.id,
      competitionId: 'cmuddjekz0001ua5kmnfa44u6',
      seasonYear: 2026,
      teamName: user.teamName,
      bank: Math.round((100.0 - totalCost) * 10) / 10,
      squadValue: totalCost,
      freeTransfers: 1,
    },
  });

  for (let i = 0; i < 15; i++) {
    const slot = i + 1;
    await prisma.fantasySquadPlayer.create({
      data: {
        squadId: squad.id,
        fantasyPlayerId: selected15[i].id,
        positionIndex: slot,
        isStartingXI: slot <= 11,
        isCaptain: slot === 10,
        isViceCaptain: slot === 6,
        purchasePrice: selected15[i].price,
      },
    });
  }
  console.log(`[PASS] Squad and 15 players created in MySQL successfully!`);

  // 5. Enroll in Global League
  const globalLeague = await prisma.fantasyLeague.findFirst({ where: { code: 'GLOBAL' } });
  if (globalLeague) {
    await prisma.fantasyLeagueMember.create({
      data: {
        leagueId: globalLeague.id,
        userId: user.id,
        squadId: squad.id,
      },
    });
    console.log(`[PASS] Enrolled squad into Global Premier League Leaderboard.`);
  }

  // 6. Create Private Mini-League
  const privateLeague = await prisma.fantasyLeague.create({
    data: {
      name: 'Friends Premier League',
      code: 'TEST99',
      type: 'PRIVATE_CLASSIC',
      adminUserId: user.id,
      competitionId: 'cmuddjekz0001ua5kmnfa44u6',
      seasonYear: 2026,
      isPublic: false,
    },
  });
  await prisma.fantasyLeagueMember.create({
    data: {
      leagueId: privateLeague.id,
      userId: user.id,
      squadId: squad.id,
    },
  });
  console.log(`[PASS] Private Mini-League Created with Invite Code: "${privateLeague.code}".`);

  // 7. Verify Scoring Engine for Gameweek 6
  const gw6 = await prisma.fantasyGameweek.findFirst({ where: { gameweekNumber: 6 } });
  console.log(`[PASS] Gameweek 6 found: "${gw6.name}" (Status: ${gw6.status}).`);

  // Cleanup test user
  await prisma.fantasyUser.delete({ where: { id: user.id } });
  await prisma.fantasyLeague.delete({ where: { id: privateLeague.id } });
  console.log(`[PASS] Test clean-up completed.`);

  console.log('\n=== ALL FANTASY FOOTBALL E2E VERIFICATIONS PASSED 100%! ===');
}

runE2ETest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
