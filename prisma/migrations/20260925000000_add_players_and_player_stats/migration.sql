-- CreateTable
CREATE TABLE `players` (
    `id` VARCHAR(191) NOT NULL,
    `providerPlayerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,
    `currentClubId` VARCHAR(191) NULL,
    `currentClubProviderId` INTEGER NULL,
    `currentNationalTeamId` VARCHAR(191) NULL,
    `currentNationalProviderId` INTEGER NULL,
    `currentSquadNumber` INTEGER NULL,
    `currentPosition` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `nationalityFlag` VARCHAR(191) NULL,
    `dateOfBirth` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `height` VARCHAR(191) NULL,
    `weight` VARCHAR(191) NULL,
    `preferredFoot` VARCHAR(191) NULL,
    `marketValue` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `players_providerPlayerId_key`(`providerPlayerId`),
    INDEX `players_currentClubId_idx`(`currentClubId`),
    INDEX `players_currentNationalTeamId_idx`(`currentNationalTeamId`),
    INDEX `players_currentClubProviderId_idx`(`currentClubProviderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_season_statistics` (
    `id` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NULL,
    `competitionId` VARCHAR(191) NULL,
    `providerPlayerId` INTEGER NOT NULL,
    `providerTeamId` INTEGER NOT NULL,
    `providerLeagueId` INTEGER NOT NULL,
    `season` INTEGER NOT NULL,
    `leagueName` VARCHAR(191) NOT NULL,
    `leagueLogo` VARCHAR(191) NULL,
    `leagueCountry` VARCHAR(191) NULL,
    `leagueFlag` VARCHAR(191) NULL,
    `isCalendarYear` BOOLEAN NOT NULL DEFAULT false,
    `teamName` VARCHAR(191) NOT NULL,
    `teamLogo` VARCHAR(191) NULL,
    `appearances` INTEGER NULL,
    `lineups` INTEGER NULL,
    `minutes` INTEGER NULL,
    `number` INTEGER NULL,
    `position` VARCHAR(191) NULL,
    `rating` DOUBLE NULL,
    `captain` BOOLEAN NOT NULL DEFAULT false,
    `goals` INTEGER NULL,
    `conceded` INTEGER NULL,
    `assists` INTEGER NULL,
    `saves` INTEGER NULL,
    `shotsTotal` INTEGER NULL,
    `shotsOnTarget` INTEGER NULL,
    `passesTotal` INTEGER NULL,
    `passesKey` INTEGER NULL,
    `passesAccuracy` INTEGER NULL,
    `tacklesTotal` INTEGER NULL,
    `blocks` INTEGER NULL,
    `interceptions` INTEGER NULL,
    `duelsTotal` INTEGER NULL,
    `duelsWon` INTEGER NULL,
    `dribblesAttempts` INTEGER NULL,
    `dribblesSuccess` INTEGER NULL,
    `foulsDrawn` INTEGER NULL,
    `foulsCommitted` INTEGER NULL,
    `yellowCards` INTEGER NULL,
    `yellowRedCards` INTEGER NULL,
    `redCards` INTEGER NULL,
    `penaltyWon` INTEGER NULL,
    `penaltyCommited` INTEGER NULL,
    `penaltyScored` INTEGER NULL,
    `penaltyMissed` INTEGER NULL,
    `penaltySaved` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `player_season_statistics_playerId_idx`(`playerId`),
    INDEX `player_season_statistics_season_idx`(`season`),
    INDEX `player_season_statistics_providerTeamId_idx`(`providerTeamId`),
    INDEX `player_season_statistics_providerLeagueId_idx`(`providerLeagueId`),
    UNIQUE INDEX `player_season_stat_unique`(`providerPlayerId`, `providerTeamId`, `providerLeagueId`, `season`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `players` ADD CONSTRAINT `players_currentClubId_fkey` FOREIGN KEY (`currentClubId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `players` ADD CONSTRAINT `players_currentNationalTeamId_fkey` FOREIGN KEY (`currentNationalTeamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_season_statistics` ADD CONSTRAINT `player_season_statistics_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_season_statistics` ADD CONSTRAINT `player_season_statistics_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_season_statistics` ADD CONSTRAINT `player_season_statistics_competitionId_fkey` FOREIGN KEY (`competitionId`) REFERENCES `competitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
