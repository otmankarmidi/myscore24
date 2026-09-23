-- CreateTable
CREATE TABLE `import_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'api-football',
    `competitionProviderId` INTEGER NOT NULL,
    `season` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `fixturesProcessed` INTEGER NOT NULL DEFAULT 0,
    `fixturesCreated` INTEGER NOT NULL DEFAULT 0,
    `fixturesUpdated` INTEGER NOT NULL DEFAULT 0,
    `fixturesSkipped` INTEGER NOT NULL DEFAULT 0,
    `requestsUsed` INTEGER NOT NULL DEFAULT 0,
    `lastError` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `import_jobs_competitionProviderId_season_idx`(`competitionProviderId`, `season`),
    INDEX `import_jobs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
