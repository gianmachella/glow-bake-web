/*
  Warnings:

  - Added the required column `updatedAt` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Made the column `deliveryDay` on table `Sale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deliveryMethod` on table `Sale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `deliveryDay` VARCHAR(191) NOT NULL,
    MODIFY `deliveryMethod` VARCHAR(191) NOT NULL;
