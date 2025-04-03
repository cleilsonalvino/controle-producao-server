/*
  Warnings:

  - You are about to drop the column `responsavel` on the `pedido` table. All the data in the column will be lost.
  - The `tempoProduzindo` column on the `pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tempoTotal` column on the `pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "pedido" DROP COLUMN "responsavel",
DROP COLUMN "tempoProduzindo",
ADD COLUMN     "tempoProduzindo" INTEGER,
DROP COLUMN "tempoTotal",
ADD COLUMN     "tempoTotal" INTEGER;

-- CreateIndex
CREATE INDEX "funcionario_nome_idx" ON "funcionario"("nome");

-- CreateIndex
CREATE INDEX "pedido_dataAtual_idx" ON "pedido"("dataAtual");

-- CreateIndex
CREATE INDEX "pedido_situacao_idx" ON "pedido"("situacao");
