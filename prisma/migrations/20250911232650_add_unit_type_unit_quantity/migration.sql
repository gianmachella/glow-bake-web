/*
  Warnings:

  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.
  - Added the required column `unitQuantity` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitType` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ingredient` DROP COLUMN `unit`,
    ADD COLUMN `unitQuantity` DOUBLE NOT NULL,
    ADD COLUMN `unitType` VARCHAR(191) NOT NULL;
