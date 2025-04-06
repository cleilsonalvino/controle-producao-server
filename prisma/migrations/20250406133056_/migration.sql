-- CreateTable
CREATE TABLE "Lencol" (
    "id" SERIAL NOT NULL,
    "quantidadeLencol" INTEGER NOT NULL,
    "quantidadeFronha" INTEGER NOT NULL,
    "quantidadeCortina" INTEGER,
    "tipoPedidoId" INTEGER NOT NULL,

    CONSTRAINT "Lencol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lencol_tipoPedidoId_key" ON "Lencol"("tipoPedidoId");

-- AddForeignKey
ALTER TABLE "Lencol" ADD CONSTRAINT "Lencol_tipoPedidoId_fkey" FOREIGN KEY ("tipoPedidoId") REFERENCES "tipoPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
