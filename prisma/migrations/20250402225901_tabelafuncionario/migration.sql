-- CreateTable
CREATE TABLE "funcionario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "pedidoId" INTEGER,

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedido"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
