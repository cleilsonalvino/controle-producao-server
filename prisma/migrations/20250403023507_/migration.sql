/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `funcionario` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nome` on table `funcionario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "funcionario" ALTER COLUMN "nome" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "funcionario_nome_key" ON "funcionario"("nome");
