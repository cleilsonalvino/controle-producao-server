/*
  Warnings:

  - Added the required column `situacao` to the `pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "situacao" TEXT NOT NULL;
