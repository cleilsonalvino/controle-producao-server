import express from "express";
const app = express();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cors from "cors";
import cron from "node-cron";

app.use(cors());
app.use(express.json());
app.post("/iniciar-pedido/:codigo", async (req, res) => {
  const { codigo } = req.params;

  try {
    const pedidoAtualizado = await prisma.pedido.update({
      where: { codigo: parseInt(codigo) },
      data: {
        horaInicio: new Date(),
        situacao: "Em andamento"
      },
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao iniciar o pedido:", error);
    res.status(500).json({ error: "Erro ao iniciar o pedido" });
  }
});

app.post("/pausar-pedido/:codigo", async (req, res) => {
  const codigo = parseInt(req.params.codigo);
  const agora = new Date();

  try {
    // Cria nova pausa
    await prisma.pausa.create({
      data: {
        horaPausa: new Date(),
        horaRetorno: null,
        pedido: {
          connect: { codigo: codigo },
        },
      },
    });
    
    

    // Atualiza situação do pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { codigo },
      data: { situacao: "Pausado" },
      include: { pausas: true },
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao pausar pedido:", error);
    res.status(500).json({ error: "Erro ao pausar pedido." });
  }
});

app.post("/reiniciar-pedido/:codigo", async (req, res) => {
  const codigo = parseInt(req.params.codigo);
  const agora = new Date();

  try {
    // Atualiza o último registro de pausa (sem horaRetorno ainda)
    await prisma.pausa.updateMany({
      where: {
        pedidoCodigo: codigo,
        horaRetorno: {
          equals: null, // <- é isso que faltava!
        },
      },
      data: {
        horaRetorno: agora,
      },
    });

    // Atualiza situação do pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { codigo },
      data: { situacao: "Em andamento" },
      include: { pausas: true },
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao reiniciar pedido:", error);
    res.status(500).json({ error: "Erro ao reiniciar pedido." });
  }
});

app.post("/finalizar-pedido/:codigo", async (req, res) => {
  const { codigo } = req.params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { codigo: Number(codigo) },
    });

    if (!pedido) {
      return res
        .status(404)
        .json({ error: `Pedido com código ${codigo} não encontrado.` });
    }

    const horaFinal = new Date();

    // Busca todas as pausas associadas a esse pedido
    const pausas = await prisma.pausa.findMany({
      where: { pedidoCodigo: Number(codigo) },
    });

    // Soma do tempo total pausado (em milissegundos)
    let totalPausaMs = 0;

    pausas.forEach((pausa) => {
      if (pausa.horaRetorno) {
        const inicio = new Date(pausa.horaPausa).getTime();
        const fim = new Date(pausa.horaRetorno).getTime();
        totalPausaMs += fim - inicio;
      }
    });

    const horaInicioMs = new Date(pedido.horaInicio).getTime();
    const horaFinalMs = horaFinal.getTime();

    const tempoTotalMs = horaFinalMs - horaInicioMs;
    const tempoProduzindoMs = tempoTotalMs - totalPausaMs;

    const formatarDuracao = (ms) => {
      const totalSegundos = Math.floor(ms / 1000);
      const h = String(Math.floor(totalSegundos / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, "0");
      const s = String(totalSegundos % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    };

    const tempoTotalFormatado = formatarDuracao(tempoTotalMs);
    const tempoProduzindoFormatado = formatarDuracao(tempoProduzindoMs);

    const pedidoFinalizado = await prisma.pedido.update({
      where: { codigo: Number(codigo) },
      data: {
        horaFinal,
        situacao: "Finalizado",
        tempoTotal: tempoTotalFormatado,
        tempoProduzindo: tempoProduzindoFormatado,
      },
    });

    res.json(pedidoFinalizado);
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    res.status(500).json({ error: "Erro ao finalizar o pedido." });
  }
});

app.post("/adicionar-pedido", async (req, res) => {
  const { codigo, tipo, quantidade, funcionarios, tipoDetalhes } = req.body;

  try {
    if (!codigo || !tipo || !quantidade) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const dadosPedido = {
      codigo: parseInt(codigo),
      tipo,
      quantidade: parseInt(quantidade),
      situacao: "Pendente",
      dataAtual: new Date(),
      funcionarios: {
        create: funcionarios?.map((id) => ({
          funcionario: { connect: { id: parseInt(id) } },
        })) || [],
      },
    };

    // Lógica para diferentes tipos de pedido
    if (tipo === "PAINEL" && Array.isArray(tipoDetalhes?.metragens)) {
      dadosPedido.tipoDetalhes = {
        create: {
          metragens: {
            create: tipoDetalhes.metragens.map((valor) => ({ valor })),
          },
        },
      };
    }

    if (tipo === "LENÇOL") {
      const qtdLencol = parseInt(quantidade);
      let qtdFronha = qtdLencol * 2;  // Por padrão, a quantidade de fronhas será o dobro dos lençóis
      let qtdCortina = 0; // Cortinas inicialmente são 0

      // Validação e ajuste para diferentes tipos de lençol
      if (tipoDetalhes?.tipoLencol === "LENÇOL SOLTEIRO") {
        qtdFronha = qtdLencol; // No caso de lençol solteiro, as fronhas são iguais à quantidade de lençóis
        qtdCortina = 0; // Não tem cortina para lençol solteiro
      } else if (tipoDetalhes?.tipoLencol === "LENÇOL CASAL") {
        qtdFronha = qtdLencol * 2; // Para lençol casal, as fronhas são o dobro
        qtdCortina = 0; // Não tem cortina para lençol casal
      } else if (tipoDetalhes?.tipoLencol === "KIT SOLTEIRO") {
        qtdFronha = qtdLencol; // No kit solteiro, as fronhas são iguais à quantidade de lençóis
        qtdCortina = qtdLencol * 2; // A quantidade de cortinas é o dobro dos lençóis
      } else if (tipoDetalhes?.tipoLencol === "KIT CASAL") {
        qtdFronha = qtdLencol * 2; // No kit casal, as fronhas são o dobro dos lençóis
        qtdCortina = qtdLencol * 2; // A quantidade de cortinas é o dobro dos lençóis
      }

      // Criando os detalhes do pedido com as quantidades ajustadas
      dadosPedido.tipoDetalhes = {
        create: {
          lencol: {
            create: {
              tipo: tipoDetalhes?.tipoLencol,
              quantidadeLencol: qtdLencol,
              quantidadeFronha: qtdFronha,
              quantidadeCortina: qtdCortina,
            },
          },
        },
      };
    }

    if (tipo === "CAMISA" && tipoDetalhes?.tipoCamisa) {
      dadosPedido.tipoDetalhes = {
        create: {
          camisa: {
            create: {
              tipo: tipoDetalhes.tipoCamisa,
            },
          },
        },
      };
    }

    if (tipo === "OUTROS" && tipoDetalhes?.tipoOutros) {
      dadosPedido.tipoDetalhes = {
        create: {
          outrosTipos: {
            create: {
              tipo: tipoDetalhes.tipoOutros,
            },
          },
        },
      };
    }

    const novoPedido = await prisma.pedido.create({
      data: dadosPedido,
      include: {
        funcionarios: {
          include: { funcionario: true },
        },
        tipoDetalhes: {
          include: {
            metragens: true,
            lencol: true,
            camisa: true,
            outrosTipos: true,
          },
        },
      },
    });

    const respostaFormatada = {
      ...novoPedido,
      funcionarios: novoPedido.funcionarios.map((f) => f.funcionario),
      maquinarios: [],
    };

    res.json(respostaFormatada);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao adicionar pedido",
      details: error.message,
    });
  }
});

app.patch('/observacao-pedido/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { observacao } = req.body;

  try {
    const pedidoAtualizado = await prisma.pedido.update({
      where: { codigo: parseInt(codigo) },
      data: { observacoes: observacao },
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao adicionar observação:", error);
    res.status(500).json({ error: "Erro ao adicionar observação" });
  }
});


app.put('/atualizar-pedido/:codigoAntigo', async (req, res) => {
  const { codigoAntigo } = req.params;
  const dadosAtualizados = req.body;

  try {
    const pedido = await prisma.pedido.update({
      where: { codigo: Number(codigoAntigo) },
      data: dadosAtualizados,
    });

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o pedido." });
  }
});

app.delete("/deletar-pedido/:codigo", async (req, res) => {
  const { codigo } = req.params;

  try {
    const pedidoDeletado = await prisma.pedido.delete({
      where: { codigo: parseInt(codigo) },
    });
    res.json(pedidoDeletado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar pedido" });
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        funcionarios: {
          select: {
            funcionario: {
              select: {
                nome: true,

              },
            },
          },
        },
        maquinarios: {  // Inclui os maquinários
          include: {
            maquinario: true, // Inclui os dados do maquinário
          },
        },
      },
    });

    // Ajustar o formato dos funcionários
    const pedidosFormatados = pedidos.map((pedido) => ({
      ...pedido,
      funcionarios: pedido.funcionarios.map((f) => f.funcionario), // Pegando apenas os dados do funcionário
    }));

    res.json(pedidosFormatados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

app.put("/mudar-situacao/:id", async (req, res) => {
  // Use "PUT" ao invés de "GET"
  const { id } = req.params; // Recuperando o ID da URL
  try {
    const pedido = await prisma.pedido.update({
      where: { codigo: parseInt(id) }, // Certificando-se de que o ID é um número
      data: { situacao: "Finalizado" }, // Atualizando a situação
    });
    res.json(pedido); // Retorna o pedido atualizado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao mudar situação do pedido" }); // Erro caso a operação falhe
  }
});

app.get("/tabela-pedidos", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        pausas: true,
        funcionarios: {
          include: {
            funcionario: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        maquinarios: {
          include: {
            maquinario: {
              select: {
                nome: true,
              },
            },
          },
        },
        tipoDetalhes: {
          include: {
            metragens: true,
            lencol: true,
            camisa: true,
            outrosTipos: true,
          },
        },
      },
      orderBy: {
        dataAtual: "desc",
      },
    });

    const pedidosFormatados = pedidos.map((pedido, index) => {
      let metragemFormatada = null;
      let lencolDetalhado = null;

      if (pedido.tipo === "PAINEL") {
        if (pedido.tipoDetalhes?.metragens?.length > 0) {
          metragemFormatada = pedido.tipoDetalhes.metragens.map(m => `${m.valor} m²`);
        } else {
          console.warn(`⚠️ Pedido #${pedido.codigo} (PAINEL) sem metragens.`);
        }
      }

      if (pedido.tipo === "LENÇOL") {
        if (pedido.tipoDetalhes?.lencol) {
          const l = pedido.tipoDetalhes.lencol;
          lencolDetalhado = {
            quantidadeLencol: l.quantidadeLencol,
            quantidadeFronha: l.quantidadeFronha,
            quantidadeCortina: l.quantidadeCortina ?? 0,
          };
        } else {
          console.warn(`⚠️ Pedido #${pedido.codigo} (LENÇOL) sem dados de lençol.`);
        }
      }

      return {
        ...pedido,
        funcionarios: pedido.funcionarios.map(f => f.funcionario),
        maquinario: pedido.maquinarios[0]?.maquinario,
        metragem: metragemFormatada,
        lencol: lencolDetalhado,
        tipoDetalhes: pedido.tipoDetalhes,
      };
    });

    res.json(pedidosFormatados);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao buscar a tabela de pedidos",
      message: error.message,
    });
  }
});


////////////////////////////////////

app.post("/adicionar-funcionario", async (req, res) => {
  const { nome, setor } = req.body;

  try {
    const funcionario = await prisma.funcionario.create({
      data: { nome, setor },
    });
    res.json(funcionario);
  } catch (error) {
    if (error.code === "P2002") {
      // Erro de violação de unicidade do Prisma
      return res.status(400).json({ error: "Funcionário já existe" });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar funcionário" });
  }
});


app.get("/funcionarios", async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany();
    res.json(funcionarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

app.delete("/deletar-funcionario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const funcionarioDeletado = await prisma.funcionario.delete({
      where: { id: parseInt(id) },
    });
    res.json(funcionarioDeletado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar funcionário" });
  }
});

///////////////////////////////

app.post("/adicionar-maquinario", async (req, res) => {
  const { nome } = req.body;

  try {
    const maquinario = await prisma.maquinario.create({
      data: { nome },
    });
    res.json(maquinario);
  } catch (error) {
    if (error.code === "P2002") {
      // Erro de violação de unicidade do Prisma
      return res.status(400).json({ error: "Maquinário já existe" });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar maquinário" });
  }
}
);

app.post("/vincular-maquinario/:codigo", async (req, res) => {
  const { codigo } = req.params;
  const { maquinarioIds } = req.body; // <- agora espera array

  try {
    const parsedCodigo = parseInt(codigo);
    if (isNaN(parsedCodigo)) {
      return res.status(400).json({ error: "Código do pedido inválido" });
    }

    if (!Array.isArray(maquinarioIds) || maquinarioIds.length === 0) {
      return res.status(400).json({ error: "Você deve enviar uma lista de IDs de maquinários" });
    }

    // Verifica se o pedido existe
    const pedidoExistente = await prisma.pedido.findUnique({ where: { codigo: parsedCodigo } });
    if (!pedidoExistente) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Filtra apenas os maquinários válidos
    const maquinariosValidos = await prisma.maquinario.findMany({
      where: {
        id: {
          in: maquinarioIds.map(Number),
        },
      },
    });

    if (maquinariosValidos.length === 0) {
      return res.status(404).json({ error: "Nenhum maquinário válido encontrado" });
    }

    // Cria vínculos evitando duplicados
    const vinculosCriados = [];

    for (const maquinario of maquinariosValidos) {
      const vinculoExistente = await prisma.pedidoMaquinario.findUnique({
        where: {
          pedidoCodigo_maquinarioId: {
            pedidoCodigo: parsedCodigo,
            maquinarioId: maquinario.id,
          },
        },
      });

      if (!vinculoExistente) {
        const novoVinculo = await prisma.pedidoMaquinario.create({
          data: {
            pedidoCodigo: parsedCodigo,
            maquinarioId: maquinario.id,
          },
        });

        vinculosCriados.push(novoVinculo);
      }
    }

    res.json({
      success: true,
      message: `${vinculosCriados.length} maquinário(s) vinculados com sucesso`,
      quantidadeVinculos: vinculosCriados.length,
    });

  } catch (error) {
    console.error("Erro ao vincular maquinários:", error);
    res.status(500).json({ error: "Erro interno ao vincular maquinários" });
  }
});

app.put("/editar-maquinarios/:codigo", async (req, res) => {
  const { codigo } = req.params;
  const { maquinarioIds } = req.body;

  if (!Array.isArray(maquinarioIds)) {
    return res.status(400).json({ error: "maquinarioIds deve ser um array de IDs" });
  }

  const parsedCodigo = parseInt(codigo);
  const parsedMaquinarioIds = maquinarioIds.map(Number).filter(id => !isNaN(id));

  try {
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { codigo: parsedCodigo },
    });

    if (!pedidoExistente) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Deleta todos os vínculos anteriores
    await prisma.pedidoMaquinario.deleteMany({
      where: { pedidoCodigo: parsedCodigo },
    });

    // Cria os novos vínculos
    const novosVinculos = await Promise.all(
      parsedMaquinarioIds.map((id) =>
        prisma.pedidoMaquinario.create({
          data: {
            pedidoCodigo: parsedCodigo,
            maquinarioId: id,
          },
        })
      )
    );

    res.json({
      success: true,
      message: "Maquinários atualizados com sucesso",
      quantidade: novosVinculos.length,
    });

  } catch (error) {
    console.error("Erro ao editar maquinários:", error);
    res.status(500).json({ error: "Erro interno ao editar maquinários" });
  }
});


app.get("/maquinarios", async (req, res) => {
  try {
    const maquinarios = await prisma.maquinario.findMany({
      include: {
        pedidos: {
          include: {
            pedido: {  // Agora acessamos o pedido através da tabela de junção
              select: {
                codigo: true,
                dataAtual: true,
                situacao: true,
                // Outros campos do pedido que você precisa
              }
            }
          }
        }
      }
    });

    // Formata a resposta para simplificar a estrutura
    const formattedMaquinarios = maquinarios.map(maq => ({
      id: maq.id,
      nome: maq.nome,
      pedidos: maq.pedidos.map(p => p.pedido) // Extrai apenas os pedidos
    }));

    res.json(formattedMaquinarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Erro ao buscar maquinários",
      details: error.message 
    });
  }
});

app.delete("/deletar-maquinario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const maquinarioDeletado = await prisma.maquinario.delete({
      where: { id: parseInt(id) },
    });
    res.json(maquinarioDeletado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar maquinário" });
  }
});


cron.schedule('* * * * *', async () => {
  const agora = new Date(); // já está no timezone do servidor
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  let inicioFaixa = null;

  // Define a faixa de pausa
  if (hora === 9 && minuto === 0) {
    inicioFaixa = new Date(agora);
    inicioFaixa.setHours(9, 0, 0, 0);
  } else if (hora === 12) {
    inicioFaixa = new Date(agora);
    inicioFaixa.setHours(12, 0, 0, 0);
  } else if (hora === 17 && minuto === 20) {
    inicioFaixa = new Date(agora);
    inicioFaixa.setHours(17, 20, 0, 0);
  }

  if (!inicioFaixa) return;

  try {
    // Busca todos os pedidos em andamento
    const pedidosAtivos = await prisma.pedido.findMany({
      where: { situacao: 'Em andamento' },
    });

    for (const pedido of pedidosAtivos) {
      const horaInicioPedido = new Date(pedido.horaInicio);

      // Se começou antes ou exatamente no início da faixa, deve ser pausado
      if (horaInicioPedido <= inicioFaixa) {
        const pausaAberta = await prisma.pausa.findFirst({
          where: {
            pedidoCodigo: pedido.codigo,
            horaRetorno: null,
          },
        });

        if (pausaAberta) {
          console.log(`⏸️ Pedido ${pedido.codigo} já está pausado.`);
          continue;
        }

        // Cria a pausa
        await prisma.pausa.create({
          data: {
            pedidoCodigo: pedido.codigo,
            horaPausa: inicioFaixa,
          },
        });

        // Atualiza o status para "Pausado"
        await prisma.pedido.update({
          where: { codigo: pedido.codigo },
          data: { situacao: 'Pausado' },
        });

        console.log(`⏸️ Pedido ${pedido.codigo} pausado automaticamente às ${inicioFaixa.toLocaleTimeString()}`);
      } else {
        console.log(`⏭️ Pedido ${pedido.codigo} começou após o início da faixa, ignorado.`);
      }
    }

  } catch (err) {
    console.error('❌ Erro no cron de pausa automática:', err);
  }
}, {
  timezone: "America/Sao_Paulo",
});


app.listen(3000, () => console.log("Servidor rodando!"));
