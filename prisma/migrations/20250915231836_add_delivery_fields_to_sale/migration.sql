/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Sale` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Sale` DROP COLUMN `updatedAt`,
    MODIFY `deliveryDay` VARCHAR(191) NULL,
    MODIFY `deliveryMethod` VARCHAR(191) NULL;
