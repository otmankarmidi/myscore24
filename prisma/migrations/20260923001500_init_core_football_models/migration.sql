-- CreateTable
CREATE TABLE `countries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `flag` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competitions` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `countryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `competitions_providerId_key`(`providerId`),
    INDEX `competitions_countryId_idx`(`countryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seasons` (
    `id` VARCHAR(191) NOT NULL,
    `competitionId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `current` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `seasons_competitionId_idx`(`competitionId`),
    UNIQUE INDEX `seasons_competitionId_year_key`(`competitionId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `founded` INTEGER NULL,
    `national` BOOLEAN NOT NULL DEFAULT false,
    `logo` VARCHAR(191) NULL,
    `venueId` INTEGER NULL,
    `venueName` VARCHAR(191) NULL,
    `venueAddress` VARCHAR(191) NULL,
    `venueCity` VARCHAR(191) NULL,
    `venueCapacity` INTEGER NULL,
    `venueSurface` VARCHAR(191) NULL,
    `venueImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastSyncedAt` DATETIME(3) NULL,

    UNIQUE INDEX `teams_providerId_key`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` VARCHAR(191) NOT NULL,
    `providerFixtureId` INTEGER NOT NULL,
    `competitionId` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `homeTeamId` VARCHAR(191) NOT NULL,
    `awayTeamId` VARCHAR(191) NOT NULL,
    `kickoff` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NULL,
    `round` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusLong` VARCHAR(191) NULL,
    `elapsed` INTEGER NULL,
    `homeScore` INTEGER NULL,
    `awayScore` INTEGER NULL,
    `halftimeHome` INTEGER NULL,
    `halftimeAway` INTEGER NULL,
    `fulltimeHome` INTEGER NULL,
    `fulltimeAway` INTEGER NULL,
    `extraTimeHome` INTEGER NULL,
    `extraTimeAway` INTEGER NULL,
    `penaltyHome` INTEGER NULL,
    `penaltyAway` INTEGER NULL,
    `venueId` INTEGER NULL,
    `venueName` VARCHAR(191) NULL,
    `venueCity` VARCHAR(191) NULL,
    `referee` VARCHAR(191) NULL,
    `isFinal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastSyncedAt` DATETIME(3) NULL,

    UNIQUE INDEX `matches_providerFixtureId_key`(`providerFixtureId`),
    INDEX `matches_kickoff_idx`(`kickoff`),
    INDEX `matches_status_idx`(`status`),
    INDEX `matches_competitionId_idx`(`competitionId`),
    INDEX `matches_seasonId_idx`(`seasonId`),
    INDEX `matches_homeTeamId_idx`(`homeTeamId`),
    INDEX `matches_awayTeamId_idx`(`awayTeamId`),
    INDEX `matches_status_kickoff_idx`(`status`, `kickoff`),
    INDEX `matches_competitionId_kickoff_idx`(`competitionId`, `kickoff`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `competitions` ADD CONSTRAINT `competitions_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seasons` ADD CONSTRAINT `seasons_competitionId_fkey` FOREIGN KEY (`competitionId`) REFERENCES `competitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_competitionId_fkey` FOREIGN KEY (`competitionId`) REFERENCES `competitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_homeTeamId_fkey` FOREIGN KEY (`homeTeamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_awayTeamId_fkey` FOREIGN KEY (`awayTeamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
