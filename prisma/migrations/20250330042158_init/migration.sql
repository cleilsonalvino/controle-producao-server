-- CreateTable
CREATE TABLE "pedido" (
    "codigo" SERIAL NOT NULL,
    "dataAtual" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaPausa" TIMESTAMP(3) NOT NULL,
    "horaReinicio" TIMESTAMP(3) NOT NULL,
    "horaFinal" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT NOT NULL,
    "tempoProduzindo" TIMESTAMP(3) NOT NULL,
    "tempoTotal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("codigo")
);
