/*
  Warnings:

  - You are about to alter the column `unitType` on the `Ingredient` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `category` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Ingredient` MODIFY `unitType` ENUM('G', 'KG', 'MG', 'ML', 'L', 'OZ', 'LB', 'FLOZ', 'CUP', 'TBSP', 'TSP', 'PT', 'QT', 'GAL', 'UNIT', 'PACK') NOT NULL;
