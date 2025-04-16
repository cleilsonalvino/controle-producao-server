-- CreateTable
CREATE TABLE "camisa" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipoPedidoId" INTEGER NOT NULL,

    CONSTRAINT "camisa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "camisa" ADD CONSTRAINT "camisa_tipoPedidoId_fkey" FOREIGN KEY ("tipoPedidoId") REFERENCES "tipoPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
