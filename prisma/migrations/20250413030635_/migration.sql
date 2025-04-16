-- CreateTable
CREATE TABLE "outroTipo" (
    "id" SERIAL NOT NULL,
    "tipoPedidoId" INTEGER NOT NULL,
    "tipo" TEXT,

    CONSTRAINT "outroTipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outroTipo_tipoPedidoId_key" ON "outroTipo"("tipoPedidoId");

-- AddForeignKey
ALTER TABLE "outroTipo" ADD CONSTRAINT "outroTipo_tipoPedidoId_fkey" FOREIGN KEY ("tipoPedidoId") REFERENCES "tipoPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
