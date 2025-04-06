-- CreateTable
CREATE TABLE "pausa" (
    "id" SERIAL NOT NULL,
    "pedidoCodigo" INTEGER NOT NULL,
    "horaPausa" TIMESTAMP(3) NOT NULL,
    "horaRetorno" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pausa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipoPedido" (
    "id" SERIAL NOT NULL,
    "pedidoCodigo" INTEGER NOT NULL,
    "metragem" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tipoPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipoPedido_pedidoCodigo_key" ON "tipoPedido"("pedidoCodigo");

-- AddForeignKey
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedido"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipoPedido" ADD CONSTRAINT "tipoPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedido"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
