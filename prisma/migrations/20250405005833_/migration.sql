/*
  Warnings:

  - You are about to drop the column `maquinarioId` on the `pedido` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_maquinarioId_fkey";

-- AlterTable
ALTER TABLE "pedido" DROP COLUMN "maquinarioId";

-- CreateTable
CREATE TABLE "pedidoMaquinario" (
    "pedidoCodigo" INTEGER NOT NULL,
    "maquinarioId" INTEGER NOT NULL,

    CONSTRAINT "pedidoMaquinario_pkey" PRIMARY KEY ("pedidoCodigo","maquinarioId")
);

-- AddForeignKey
ALTER TABLE "pedidoMaquinario" ADD CONSTRAINT "pedidoMaquinario_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedido"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidoMaquinario" ADD CONSTRAINT "pedidoMaquinario_maquinarioId_fkey" FOREIGN KEY ("maquinarioId") REFERENCES "maquinario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
