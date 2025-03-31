/*
  Warnings:

  - Added the required column `responsavel` to the `pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "responsavel" TEXT NOT NULL;
