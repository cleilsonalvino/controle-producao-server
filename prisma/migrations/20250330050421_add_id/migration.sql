/*
  Warnings:

  - The primary key for the `pedido` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "codigo" DROP DEFAULT,
ADD CONSTRAINT "pedido_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "pedido_codigo_seq";
