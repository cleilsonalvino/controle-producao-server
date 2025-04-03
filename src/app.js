import express from 'express';
const app = express();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import cors from 'cors';

app.use(cors());
app.use(express.json());
app.post('/iniciar-pedido/:codigo', async (req, res) => {
    const { codigo } = req.params;
  
    try {
      // Atualiza o pedido com a hora de início e status "Em andamento"
      const pedido = await prisma.pedido.update({
        where: { codigo: Number(codigo) },
        data: {
          horaInicio: new Date(),  // Hora de início
          situacao: 'Em andamento' // Atualize a situação do pedido
        }
      });
      res.json(pedido);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao iniciar o pedido.' });
    }
  });
  
  app.post('/pausar-pedido/:codigo', async (req, res) => {
    const { codigo } = req.params;
  
    try {
      // Verifica se o pedido existe
      const pedido = await prisma.pedido.findUnique({
        where: { codigo: Number(codigo) }
      });
  
      if (!pedido) {
        return res.status(404).json({ error: `Pedido com código ${codigo} não encontrado.` });
      }
  
      // Registra a hora de pausa
      const horaPausa = new Date();
  
      // Atualiza o pedido, marcando como pausado
      const pedidoAtualizado = await prisma.pedido.update({
        where: { codigo: Number(codigo) },
        data: {
          horaPausa,
          situacao: 'Pausado'
        }
      });
  
      res.json(pedidoAtualizado);
    } catch (error) {
      res.status(500).json({ error: `Erro ao pausar o pedido: ${error.message}` });
    }
  });
  
  app.post('/reiniciar-pedido/:codigo', async (req, res) => {
    const { codigo } = req.params;
  
    try {
      // Verifica se o pedido existe
      const pedido = await prisma.pedido.findUnique({
        where: { codigo: Number(codigo) }
      });
  
      if (!pedido) {
        return res.status(404).json({ error: `Pedido com código ${codigo} não encontrado.` });
      }
  
      // Registra a hora de reinício
      const horaReinicio = new Date();
  
      // Atualiza o pedido com a hora de reinício e o status como "Em andamento"
      const pedidoAtualizado = await prisma.pedido.update({
        where: { codigo: Number(codigo) },
        data: {
          horaReinicio,
          situacao: 'Em andamento'
        }
      });
  
      res.json(pedidoAtualizado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao reiniciar o pedido.' });
    }
  });
  
  app.post('/finalizar-pedido/:codigo', async (req, res) => {
    const { codigo } = req.params;
  
    try {
      // Verifica se o pedido existe
      const pedido = await prisma.pedido.findUnique({
        where: { codigo: Number(codigo) }
      });
  
      if (!pedido) {
        return res.status(404).json({ error: `Pedido com código ${codigo} não encontrado.` });
      }
  
      // Registra a hora de finalização
      const horaFinal = new Date();
  
      // Atualiza o pedido, marcando como finalizado
      const pedidoFinalizado = await prisma.pedido.update({
        where: { codigo: Number(codigo) },
        data: {
          horaFinal,
          situacao: 'Finalizado'
        }
      });
  
      res.json(pedidoFinalizado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao finalizar o pedido.' });
    }
  });
  
  

  app.post('/adicionar-pedido', async (req, res) => {
    const { codigo, tipo, quantidade, funcionarios } = req.body;

    try {
        // Criando o pedido
        const novoPedido = await prisma.pedido.create({
            data: {
                codigo: parseInt(codigo),
                tipo,
                quantidade: parseInt(quantidade),
                situacao: 'Pendente',
                dataAtual: new Date(),
                funcionarios: {
                    create: funcionarios.map(id => ({
                        funcionario: { connect: { id: parseInt(id) } }
                    }))
                }
            },
            include: { funcionarios: { include: { funcionario: true } } } // Retorna os dados dos funcionários
        });

        console.log(novoPedido);
        res.json(novoPedido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar pedido' });
    }
});



app.delete('/deletar-pedido/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const pedidoDeletado = await prisma.pedido.delete({
            where: { codigo: parseInt(codigo) },
        });
        res.json(pedidoDeletado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
});

app.get('/pedidos', async (req, res) => { 
  try {
      const pedidos = await prisma.pedido.findMany({
          include: {
              funcionarios: {
                  include: {
                      funcionario: true, // Inclui os dados do funcionário
                  },
              },
          },
      });

      // Ajustar o formato dos funcionários
      const pedidosFormatados = pedidos.map((pedido) => ({
          ...pedido,
          funcionarios: pedido.funcionarios.map(f => f.funcionario) // Pegando apenas os dados do funcionário
      }));

      res.json(pedidosFormatados);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});


app.put('/mudar-situacao/:id', async (req, res) => {  // Use "PUT" ao invés de "GET"
    const { id } = req.params;  // Recuperando o ID da URL
    try {
        const pedido = await prisma.pedido.update({
            where: { codigo: parseInt(id) },  // Certificando-se de que o ID é um número
            data: { situacao: 'Finalizado' },  // Atualizando a situação
        });
        res.json(pedido);  // Retorna o pedido atualizado
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao mudar situação do pedido' });  // Erro caso a operação falhe
    }
});

app.post('/adicionar-funcionario', async (req, res) => {
  const { nome, setor } = req.body;

  try {
      const funcionario = await prisma.funcionario.create({
          data: { nome, setor },
      });
      res.json(funcionario);
  } catch (error) {
      if (error.code === 'P2002') { // Erro de violação de unicidade do Prisma
          return res.status(400).json({ error: 'Funcionário já existe' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro ao adicionar funcionário' });
  }
});


app.get('/funcionarios', async (req, res) => {
    try {
        const funcionarios = await prisma.funcionario.findMany();
        res.json(funcionarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }
});

app.delete('/deletar-funcionario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const funcionarioDeletado = await prisma.funcionario.delete({
            where: { id: parseInt(id) },
        });
        res.json(funcionarioDeletado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar funcionário' });
    }
}
);
// Backend endpoint
app.get('/tabela-pedidos', async (req, res) => {
  try {
    const tabelaPedidos = await prisma.pedido.findMany({
      include: {
        funcionarios: {
          include: {
            funcionario: {
              select: {
                id: true, // Certifique-se de que isso está aqui se você tentou a Opção 2
                nome: true,
              }
            }
          }
        }
      },
      orderBy: {
        dataAtual: 'desc'
      }
    });

    console.log("Dados do Prisma:", tabelaPedidos); // Adicione esta linha

    const formattedPedidos = tabelaPedidos.map(pedido => ({
      ...pedido,
      funcionarios: pedido.funcionarios.map(f => f.funcionario)
    }));

    res.json(formattedPedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao buscar a tabela de pedidos',
      message: error.message
    });
  }
});

app.post('/adicionar-maquinario', async (req, res) => {
  const { nome } = req.body;

  try {
    // Verifica se o nome já existe no banco de dados
    const maquinarioExistente = await prisma.maquinario.findUnique({
      where: { nome },
    });

    if (maquinarioExistente) {
      return res.status(400).json({ error: 'Já existe um maquinário com esse nome' });
    }

    // Se não existir, cria um novo
    const maquinario = await prisma.maquinario.create({
      data: { nome },
    });

    res.json(maquinario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar maquinário' });
  }
});

app.get('/maquinarios', async (req, res) => {
  try {
    const maquinarios = await prisma.maquinario.findMany();
    res.json(maquinarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar maquinários' });
  }
});
app.delete('/deletar-maquinario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const maquinarioDeletado = await prisma.maquinario.delete({
      where: { id: parseInt(id) },
    });
    res.json(maquinarioDeletado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar maquinário' });
  }
});

app.listen(3000, () => console.log('Servidor rodando!'));
