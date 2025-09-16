/*
  Warnings:

  - The values [G,KG,MG,ML,L,OZ,LB,FLOZ,CUP,TBSP,TSP,PT,QT,GAL,UNIT,PACK] on the enum `Ingredient_unitType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Ingredient` MODIFY `unitType` ENUM('g', 'kg', 'mg', 'ml', 'l', 'oz', 'lb', 'floz', 'cup', 'tbsp', 'tsp', 'pt', 'qt', 'gal', 'unidad', 'pack') NOT NULL;
