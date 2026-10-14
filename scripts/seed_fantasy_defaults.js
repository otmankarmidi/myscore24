const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_SCORING_RULES = [
  { ruleKey: 'PLAYED_UP_TO_60_MINS', description: 'Playing up to 60 minutes', pointsValue: 1, category: 'MINUTES' },
  { ruleKey: 'PLAYED_60_MINS_OR_MORE', description: 'Playing 60 minutes or more (excluding stoppage time)', pointsValue: 2, category: 'MINUTES' },
  { ruleKey: 'GOAL_SCORED_GKP', description: 'Goal scored by a goalkeeper', pointsValue: 6, category: 'GOALS' },
  { ruleKey: 'GOAL_SCORED_DEF', description: 'Goal scored by a defender', pointsValue: 6, category: 'GOALS' },
  { ruleKey: 'GOAL_SCORED_MID', description: 'Goal scored by a midfielder', pointsValue: 5, category: 'GOALS' },
  { ruleKey: 'GOAL_SCORED_FWD', description: 'Goal scored by a forward', pointsValue: 4, category: 'GOALS' },
  { ruleKey: 'GOAL_ASSIST', description: 'For each goal assist', pointsValue: 3, category: 'GOALS' },
  { ruleKey: 'CLEAN_SHEET_GKP', description: 'Clean sheet by a goalkeeper (must play 60+ mins)', pointsValue: 4, category: 'DEFENSE' },
  { ruleKey: 'CLEAN_SHEET_DEF', description: 'Clean sheet by a defender (must play 60+ mins)', pointsValue: 4, category: 'DEFENSE' },
  { ruleKey: 'CLEAN_SHEET_MID', description: 'Clean sheet by a midfielder (must play 60+ mins)', pointsValue: 1, category: 'DEFENSE' },
  { ruleKey: 'CONCEDED_EVERY_2_GOALS', description: 'For every 2 goals conceded by a goalkeeper or defender', pointsValue: -1, category: 'DEFENSE' },
  { ruleKey: 'SAVES_EVERY_3', description: 'For every 3 shot saves by a goalkeeper', pointsValue: 1, category: 'DEFENSE' },
  { ruleKey: 'PENALTY_SAVED', description: 'Penalty save by a goalkeeper', pointsValue: 5, category: 'DEFENSE' },
  { ruleKey: 'PENALTY_MISSED', description: 'Penalty miss by any player', pointsValue: -2, category: 'DISCIPLINE' },
  { ruleKey: 'YELLOW_CARD', description: 'Yellow card shown to player', pointsValue: -1, category: 'DISCIPLINE' },
  { ruleKey: 'RED_CARD', description: 'Red card shown to player', pointsValue: -3, category: 'DISCIPLINE' },
  { ruleKey: 'OWN_GOAL', description: 'Own goal scored by player', pointsValue: -2, category: 'DISCIPLINE' },
  { ruleKey: 'TRANSFER_PENALTY', description: 'Cost per additional transfer beyond free allowance', pointsValue: -4, category: 'TRANSFERS' }
];

async function seedScoringRules() {
  console.log('Seeding Fantasy Scoring Rules...');
  for (const rule of DEFAULT_SCORING_RULES) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO fantasy_scoring_rules (id, ruleKey, description, pointsValue, category, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(3))
       ON DUPLICATE KEY UPDATE description = VALUES(description), pointsValue = VALUES(pointsValue), category = VALUES(category), updatedAt = NOW(3)`,
      `rule_${rule.ruleKey.toLowerCase()}`,
      rule.ruleKey,
      rule.description,
      rule.pointsValue,
      rule.category
    );
  }
  console.log(`Seeded ${DEFAULT_SCORING_RULES.length} scoring rules.`);
}

async function seedGlobalLeagues() {
  console.log('Seeding Global League...');
  // Find Premier League competition
  const plCompetition = await prisma.$queryRawUnsafe(
    `SELECT id FROM competitions WHERE providerId = 39 LIMIT 1`
  );
  const compId = plCompetition.length > 0 ? plCompetition[0].id : 'cmuddjfv40001ua5k195325i3';

  await prisma.$executeRawUnsafe(
    `INSERT INTO fantasy_leagues (id, name, code, type, adminUserId, competitionId, seasonYear, isPublic, maxMembers, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, NULL, ?, 2026, TRUE, NULL, NOW(3), NOW(3))
     ON DUPLICATE KEY UPDATE name = VALUES(name), isPublic = TRUE, updatedAt = NOW(3)`,
    'league_global_pl_2026',
    'Overall Premier League 2026',
    'GLOBAL',
    'GLOBAL',
    compId
  );
  console.log('Global Premier League seeded.');
}

async function main() {
  await seedScoringRules();
  await seedGlobalLeagues();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
