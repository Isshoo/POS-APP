import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTransactions() {
  console.log('Menghapus semua transaksi...');
  
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  
  console.log('Semua transaksi berhasil dihapus!');
}

clearTransactions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
