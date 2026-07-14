/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Cookie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Cookie` MODIFY `shortDescription` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `ingredients` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cookie_name_key` ON `Cookie`(`name`);
