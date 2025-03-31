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
    const { codigo, tipo, quantidade, responsavel } = req.body;

    try {
        // Usando new Date() para pegar a data e hora atuais
        const dataAtual = new Date();

        // Criando o pedido com a data atual
        const dados = await prisma.pedido.create({
            data: {
                codigo: parseInt(codigo),
                tipo,
                quantidade: parseInt(quantidade),
                responsavel,
                situacao: 'Pendente',
                dataAtual: dataAtual,  // Corrigido para "data"
            },
        });

        console.log(dados);
        res.json(dados); // Envia os dados do pedido criado como resposta
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
        const pedidos = await prisma.pedido.findMany();
        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
})

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

app.get('/tabela-pedidos', async (req, res) => {
    try {
        const tabelaPedidos = await prisma.pedido.findMany();
        res.json(tabelaPedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar a tabela de pedidos' });
    }
});

app.listen(3000, () => console.log('Servidor rodando!'));
