import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE NomeDaTabela RESTART IDENTITY CASCADE;`);
  console.log("Banco de dados resetado!");
}

resetDatabase()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
