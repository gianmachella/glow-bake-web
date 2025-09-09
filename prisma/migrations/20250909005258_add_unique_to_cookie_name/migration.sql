/*
  Warnings:

  - You are about to drop the column `images` on the `Cookie` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Cookie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Cookie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Cookie" DROP COLUMN "images",
DROP COLUMN "shortDescription";

-- CreateIndex
CREATE UNIQUE INDEX "Cookie_name_key" ON "public"."Cookie"("name");
