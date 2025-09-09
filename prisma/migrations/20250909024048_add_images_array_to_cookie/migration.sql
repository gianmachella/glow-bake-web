-- AlterTable
ALTER TABLE "public"."Cookie" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
