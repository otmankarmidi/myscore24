const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ddlStatements = [
  // 1. fantasy_users
  `CREATE TABLE IF NOT EXISTS fantasy_users (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    managerName VARCHAR(100) NOT NULL,
    teamName VARCHAR(100) NOT NULL UNIQUE,
    favoriteClubId VARCHAR(191) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    avatar VARCHAR(255) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 2. fantasy_gameweeks
  `CREATE TABLE IF NOT EXISTS fantasy_gameweeks (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    gameweekNumber INT NOT NULL,
    seasonYear INT NOT NULL,
    competitionId VARCHAR(191) NOT NULL,
    name VARCHAR(100) NOT NULL,
    deadline DATETIME(3) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'UPCOMING',
    isCurrent BOOLEAN NOT NULL DEFAULT FALSE,
    totalFixtures INT NOT NULL DEFAULT 10,
    scoredAt DATETIME(3) NULL,
    finalizedAt DATETIME(3) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_competition_season_gameweek (competitionId, seasonYear, gameweekNumber),
    INDEX idx_gw_status (status),
    INDEX idx_gw_current (isCurrent)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 3. fantasy_gameweek_fixtures
  `CREATE TABLE IF NOT EXISTS fantasy_gameweek_fixtures (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    gameweekId VARCHAR(191) NOT NULL,
    matchId VARCHAR(191) NOT NULL,
    isScored BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_gameweek_match (gameweekId, matchId),
    INDEX idx_gw_fixtures_match (matchId),
    CONSTRAINT fk_gw_fixtures_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE,
    CONSTRAINT fk_gw_fixtures_match FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 4. fantasy_players
  `CREATE TABLE IF NOT EXISTS fantasy_players (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    playerId VARCHAR(191) NULL,
    providerPlayerId INT NULL,
    name VARCHAR(191) NOT NULL,
    webName VARCHAR(100) NOT NULL,
    teamId VARCHAR(191) NOT NULL,
    teamProviderId INT NOT NULL,
    teamShortName VARCHAR(20) NOT NULL,
    position VARCHAR(10) NOT NULL,
    price DOUBLE NOT NULL,
    startPrice DOUBLE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    news VARCHAR(255) NULL,
    chanceOfPlaying INT NULL,
    totalPoints INT NOT NULL DEFAULT 0,
    goalsTotal INT NOT NULL DEFAULT 0,
    assistsTotal INT NOT NULL DEFAULT 0,
    cleanSheetsTotal INT NOT NULL DEFAULT 0,
    minutesTotal INT NOT NULL DEFAULT 0,
    yellowCardsTotal INT NOT NULL DEFAULT 0,
    redCardsTotal INT NOT NULL DEFAULT 0,
    photo VARCHAR(500) NULL,
    selectedByPercent DOUBLE NOT NULL DEFAULT 0.0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_fp_team (teamId),
    INDEX idx_fp_pos (position),
    INDEX idx_fp_price (price),
    INDEX idx_fp_points (totalPoints),
    INDEX idx_fp_provider (providerPlayerId),
    CONSTRAINT fk_fp_team FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 5. fantasy_player_price_histories
  `CREATE TABLE IF NOT EXISTS fantasy_player_price_histories (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    fantasyPlayerId VARCHAR(191) NOT NULL,
    gameweekNumber INT NOT NULL,
    oldPrice DOUBLE NOT NULL,
    newPrice DOUBLE NOT NULL,
    changeReason VARCHAR(255) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_fpph_player (fantasyPlayerId),
    CONSTRAINT fk_fpph_player FOREIGN KEY (fantasyPlayerId) REFERENCES fantasy_players(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 6. fantasy_squads
  `CREATE TABLE IF NOT EXISTS fantasy_squads (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL UNIQUE,
    competitionId VARCHAR(191) NOT NULL,
    seasonYear INT NOT NULL,
    teamName VARCHAR(100) NOT NULL,
    bank DOUBLE NOT NULL DEFAULT 0.0,
    squadValue DOUBLE NOT NULL DEFAULT 100.0,
    freeTransfers INT NOT NULL DEFAULT 1,
    totalTransfers INT NOT NULL DEFAULT 0,
    totalPoints INT NOT NULL DEFAULT 0,
    overallRank INT NULL,
    activeChip VARCHAR(30) NULL,
    wildcardUsedAt DATETIME(3) NULL,
    tripleCaptainUsedAt DATETIME(3) NULL,
    benchBoostUsedAt DATETIME(3) NULL,
    freeHitUsedAt DATETIME(3) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_squad_points (totalPoints),
    CONSTRAINT fk_squad_user FOREIGN KEY (userId) REFERENCES fantasy_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 7. fantasy_squad_players
  `CREATE TABLE IF NOT EXISTS fantasy_squad_players (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    squadId VARCHAR(191) NOT NULL,
    fantasyPlayerId VARCHAR(191) NOT NULL,
    positionIndex INT NOT NULL,
    isStartingXI BOOLEAN NOT NULL DEFAULT TRUE,
    isCaptain BOOLEAN NOT NULL DEFAULT FALSE,
    isViceCaptain BOOLEAN NOT NULL DEFAULT FALSE,
    purchasePrice DOUBLE NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_squad_player (squadId, fantasyPlayerId),
    INDEX idx_sp_squad (squadId),
    INDEX idx_sp_player (fantasyPlayerId),
    CONSTRAINT fk_sp_squad FOREIGN KEY (squadId) REFERENCES fantasy_squads(id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_player FOREIGN KEY (fantasyPlayerId) REFERENCES fantasy_players(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 8. fantasy_gameweek_squad_snapshots
  `CREATE TABLE IF NOT EXISTS fantasy_gameweek_squad_snapshots (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    squadId VARCHAR(191) NOT NULL,
    gameweekId VARCHAR(191) NOT NULL,
    gameweekNumber INT NOT NULL,
    activeChip VARCHAR(30) NULL,
    snapshotJson JSON NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_snapshot_squad_gw (squadId, gameweekId),
    INDEX idx_snap_gw (gameweekId),
    CONSTRAINT fk_snap_squad FOREIGN KEY (squadId) REFERENCES fantasy_squads(id) ON DELETE CASCADE,
    CONSTRAINT fk_snap_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 9. fantasy_transfers
  `CREATE TABLE IF NOT EXISTS fantasy_transfers (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    squadId VARCHAR(191) NOT NULL,
    gameweekId VARCHAR(191) NOT NULL,
    gameweekNumber INT NOT NULL,
    playerInId VARCHAR(191) NOT NULL,
    playerOutId VARCHAR(191) NOT NULL,
    playerInPrice DOUBLE NOT NULL,
    playerOutPrice DOUBLE NOT NULL,
    isFreeTransfer BOOLEAN NOT NULL DEFAULT TRUE,
    pointCost INT NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_tr_squad (squadId),
    INDEX idx_tr_gw (gameweekId),
    CONSTRAINT fk_tr_squad FOREIGN KEY (squadId) REFERENCES fantasy_squads(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 10. fantasy_player_match_points
  `CREATE TABLE IF NOT EXISTS fantasy_player_match_points (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    fantasyPlayerId VARCHAR(191) NOT NULL,
    matchId VARCHAR(191) NOT NULL,
    gameweekId VARCHAR(191) NOT NULL,
    minutesPlayed INT NOT NULL DEFAULT 0,
    goalsScored INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    cleanSheet BOOLEAN NOT NULL DEFAULT FALSE,
    goalsConceded INT NOT NULL DEFAULT 0,
    ownGoals INT NOT NULL DEFAULT 0,
    penaltiesSaved INT NOT NULL DEFAULT 0,
    penaltiesMissed INT NOT NULL DEFAULT 0,
    yellowCards INT NOT NULL DEFAULT 0,
    redCards INT NOT NULL DEFAULT 0,
    saves INT NOT NULL DEFAULT 0,
    bonusPoints INT NOT NULL DEFAULT 0,
    totalPoints INT NOT NULL DEFAULT 0,
    breakdown JSON NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_pmp_player_match (fantasyPlayerId, matchId),
    INDEX idx_pmp_gw (gameweekId),
    INDEX idx_pmp_match (matchId),
    CONSTRAINT fk_pmp_player FOREIGN KEY (fantasyPlayerId) REFERENCES fantasy_players(id) ON DELETE CASCADE,
    CONSTRAINT fk_pmp_match FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_pmp_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 11. fantasy_player_gameweek_points
  `CREATE TABLE IF NOT EXISTS fantasy_player_gameweek_points (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    fantasyPlayerId VARCHAR(191) NOT NULL,
    gameweekId VARCHAR(191) NOT NULL,
    totalPoints INT NOT NULL DEFAULT 0,
    minutesPlayed INT NOT NULL DEFAULT 0,
    goalsScored INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    cleanSheets INT NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_pgp_player_gw (fantasyPlayerId, gameweekId),
    INDEX idx_pgp_gw (gameweekId),
    CONSTRAINT fk_pgp_player FOREIGN KEY (fantasyPlayerId) REFERENCES fantasy_players(id) ON DELETE CASCADE,
    CONSTRAINT fk_pgp_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 12. fantasy_manager_gameweek_points
  `CREATE TABLE IF NOT EXISTS fantasy_manager_gameweek_points (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    squadId VARCHAR(191) NOT NULL,
    gameweekId VARCHAR(191) NOT NULL,
    gameweekNumber INT NOT NULL,
    grossPoints INT NOT NULL DEFAULT 0,
    transferCost INT NOT NULL DEFAULT 0,
    netPoints INT NOT NULL DEFAULT 0,
    gameweekRank INT NULL,
    overallPoints INT NOT NULL DEFAULT 0,
    overallRank INT NULL,
    pointsBreakdown JSON NULL,
    calculatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_mgp_squad_gw (squadId, gameweekId),
    INDEX idx_mgp_gw (gameweekId),
    CONSTRAINT fk_mgp_squad FOREIGN KEY (squadId) REFERENCES fantasy_squads(id) ON DELETE CASCADE,
    CONSTRAINT fk_mgp_gw FOREIGN KEY (gameweekId) REFERENCES fantasy_gameweeks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 13. fantasy_leagues
  `CREATE TABLE IF NOT EXISTS fantasy_leagues (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL DEFAULT 'PRIVATE_CLASSIC',
    adminUserId VARCHAR(191) NULL,
    competitionId VARCHAR(191) NOT NULL,
    seasonYear INT NOT NULL,
    isPublic BOOLEAN NOT NULL DEFAULT FALSE,
    maxMembers INT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_league_comp (competitionId, seasonYear),
    INDEX idx_league_type (type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 14. fantasy_league_members
  `CREATE TABLE IF NOT EXISTS fantasy_league_members (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    leagueId VARCHAR(191) NOT NULL,
    userId VARCHAR(191) NOT NULL,
    squadId VARCHAR(191) NOT NULL,
    joinedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    currentRank INT NULL,
    previousRank INT NULL,
    UNIQUE KEY uq_lm_league_squad (leagueId, squadId),
    INDEX idx_lm_league (leagueId),
    INDEX idx_lm_user (userId),
    CONSTRAINT fk_lm_league FOREIGN KEY (leagueId) REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
    CONSTRAINT fk_lm_squad FOREIGN KEY (squadId) REFERENCES fantasy_squads(id) ON DELETE CASCADE,
    CONSTRAINT fk_lm_user FOREIGN KEY (userId) REFERENCES fantasy_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 15. fantasy_scoring_rules
  `CREATE TABLE IF NOT EXISTS fantasy_scoring_rules (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    ruleKey VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    pointsValue INT NOT NULL,
    category VARCHAR(30) NOT NULL,
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 16. fantasy_job_executions
  `CREATE TABLE IF NOT EXISTS fantasy_job_executions (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    jobName VARCHAR(100) NOT NULL,
    gameweekNumber INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    payload JSON NULL,
    errorMessage TEXT NULL,
    startedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    completedAt DATETIME(3) NULL,
    INDEX idx_job_name (jobName),
    INDEX idx_job_gw (gameweekNumber)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

async function migrate() {
  console.log(`Starting idempotent MySQL fantasy migration (${ddlStatements.length} statements)...`);
  for (let i = 0; i < ddlStatements.length; i++) {
    const stmt = ddlStatements[i];
    const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    const tableName = match ? match[1] : `statement_${i}`;
    process.stdout.write(`Creating table ${tableName}... `);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log('OK');
    } catch (err) {
      console.error(`FAILED:`, err.message);
      throw err;
    }
  }
  console.log('All fantasy tables created successfully!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
