/*
  Warnings:

  - The values [g,kg,mg,ml,l,oz,lb,floz,cup,tbsp,tsp,pt,qt,gal,unidad,pack] on the enum `Ingredient_unitType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Ingredient` ADD COLUMN `packages` INTEGER NOT NULL DEFAULT 1,
    MODIFY `unitType` ENUM('G', 'KG', 'MG', 'ML', 'L', 'OZ', 'LB', 'FLOZ', 'CUP', 'TBSP', 'TSP', 'PT', 'QT', 'GAL', 'UNIT', 'PACK') NOT NULL;
