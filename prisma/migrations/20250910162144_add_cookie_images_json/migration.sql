/*
  Warnings:

  - You are about to drop the column `image1` on the `Cookie` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `Cookie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Cookie` DROP COLUMN `image1`,
    DROP COLUMN `image2`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `images` JSON NULL;
