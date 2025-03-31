/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `pedido` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pedido_codigo_key" ON "pedido"("codigo");
