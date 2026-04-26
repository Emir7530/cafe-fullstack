/*
  Warnings:

  - You are about to drop the column `imageCropX` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageCropY` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageZoom` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageCropX",
DROP COLUMN "imageCropY",
DROP COLUMN "imageZoom";
