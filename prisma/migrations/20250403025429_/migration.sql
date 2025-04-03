-- CreateTable
CREATE TABLE "maquinarioPedido" (
    "pedidoCodigo" INTEGER NOT NULL,
    "maquinarioId" INTEGER NOT NULL,

    CONSTRAINT "maquinarioPedido_pkey" PRIMARY KEY ("pedidoCodigo","maquinarioId")
);

-- CreateTable
CREATE TABLE "maquinario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "maquinario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maquinario_nome_key" ON "maquinario"("nome");

-- AddForeignKey
ALTER TABLE "maquinarioPedido" ADD CONSTRAINT "maquinarioPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedido"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maquinarioPedido" ADD CONSTRAINT "maquinarioPedido_maquinarioId_fkey" FOREIGN KEY ("maquinarioId") REFERENCES "maquinario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
