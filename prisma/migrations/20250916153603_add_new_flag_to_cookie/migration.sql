-- DropIndex
DROP INDEX `Cookie_name_key` ON `Cookie`;

-- AlterTable
ALTER TABLE `Cookie` ADD COLUMN `new` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `shortDescription` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `ingredients` VARCHAR(191) NULL;
