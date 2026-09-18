-- CreateTable
CREATE TABLE `WeeklyMenuItem` (
    `id` VARCHAR(191) NOT NULL,
    `cookieId` VARCHAR(191) NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `batchLimit` INTEGER NOT NULL,
    `sold` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WeeklyMenuItem_weekStart_idx`(`weekStart`),
    UNIQUE INDEX `WeeklyMenuItem_cookieId_weekStart_key`(`cookieId`, `weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeeklyMenuItem` ADD CONSTRAINT `WeeklyMenuItem_cookieId_fkey` FOREIGN KEY (`cookieId`) REFERENCES `Cookie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
