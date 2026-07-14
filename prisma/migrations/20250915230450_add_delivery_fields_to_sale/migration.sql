/*
  Warnings:

  - Added the required column `deliveryDay` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethod` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `deliveryDay` VARCHAR(191) NOT NULL,
    ADD COLUMN `deliveryMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
