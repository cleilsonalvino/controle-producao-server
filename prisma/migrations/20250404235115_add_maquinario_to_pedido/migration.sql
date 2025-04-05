/*
  Warnings:

  - You are about to drop the `maquinarioPedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "maquinarioPedido" DROP CONSTRAINT "maquinarioPedido_maquinarioId_fkey";

-- DropForeignKey
ALTER TABLE "maquinarioPedido" DROP CONSTRAINT "maquinarioPedido_pedidoCodigo_fkey";

-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "maquinarioId" INTEGER;

-- DropTable
DROP TABLE "maquinarioPedido";

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_maquinarioId_fkey" FOREIGN KEY ("maquinarioId") REFERENCES "maquinario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
