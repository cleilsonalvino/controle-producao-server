/*
  Warnings:

  - The primary key for the `pedido` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `pedido` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "pedido_pkey" PRIMARY KEY ("codigo");
