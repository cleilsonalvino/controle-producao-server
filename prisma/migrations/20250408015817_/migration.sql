/*
  Warnings:

  - You are about to drop the column `horaPausa` on the `pedido` table. All the data in the column will be lost.
  - You are about to drop the column `horaReinicio` on the `pedido` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pausa" ALTER COLUMN "horaRetorno" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pedido" DROP COLUMN "horaPausa",
DROP COLUMN "horaReinicio";
