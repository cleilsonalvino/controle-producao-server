-- DropForeignKey
ALTER TABLE "funcionarioPedido" DROP CONSTRAINT "funcionarioPedido_funcionarioId_fkey";

-- DropIndex
DROP INDEX "funcionario_nome_idx";

-- DropIndex
DROP INDEX "pedido_dataAtual_idx";

-- DropIndex
DROP INDEX "pedido_situacao_idx";

-- AddForeignKey
ALTER TABLE "funcionarioPedido" ADD CONSTRAINT "funcionarioPedido_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
