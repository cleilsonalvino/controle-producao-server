/*
  Warnings:

  - You are about to drop the column `metragem` on the `tipoPedido` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tipoPedido" DROP COLUMN "metragem";

-- CreateTable
CREATE TABLE "Metragem" (
    "id" SERIAL NOT NULL,
    "valor" TEXT NOT NULL,
    "tipoPedidoId" INTEGER NOT NULL,

    CONSTRAINT "Metragem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Metragem" ADD CONSTRAINT "Metragem_tipoPedidoId_fkey" FOREIGN KEY ("tipoPedidoId") REFERENCES "tipoPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
