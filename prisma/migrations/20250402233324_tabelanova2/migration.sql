/*
  Warnings:

  - You are about to drop the column `pedidoId` on the `funcionario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "funcionario" DROP CONSTRAINT "funcionario_pedidoId_fkey";

-- AlterTable
ALTER TABLE "funcionario" DROP COLUMN "pedidoId";

-- CreateTable
CREATE TABLE "funcionarioPedido" (
    "pedidoCodigo" INTEGER NOT NULL,
    "funcionarioId" INTEGER NOT NULL,

    CONSTRAINT "funcionarioPedido_pkey" PRIMARY KEY ("pedidoCodigo","funcionarioId")
);

-- AddForeignKey
ALTER TABLE "funcionarioPedido" ADD CONSTRAINT "funcionarioPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedido"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarioPedido" ADD CONSTRAINT "funcionarioPedido_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
