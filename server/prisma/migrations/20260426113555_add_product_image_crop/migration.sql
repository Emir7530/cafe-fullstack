/*
  Warnings:

  - You are about to drop the column `imagePositionX` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imagePositionY` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imagePositionX",
DROP COLUMN "imagePositionY",
ADD COLUMN     "imageCropX" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imageCropY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imageZoom" DOUBLE PRECISION NOT NULL DEFAULT 1;
