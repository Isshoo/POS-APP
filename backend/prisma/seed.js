import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Bersihkan data lama (urutan penting karena relasi)
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.salesPerson.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // User admin awal
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Toko',
      email: 'admin@toko-bangunan.local',
      password: passwordHash,
      role: 'admin',
      lastLoginAt: new Date(),
    },
  });

  console.log('User admin dibuat:', admin.email);

  // Produk awal
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'P-001',
        name: 'Semen Portland 50kg',
        category: 'Material',
        type: 'Material Dasar',
        unit: 'Sak',
        price: 75000,
        stock: 120,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'P-002',
        name: 'Besi Beton 10mm',
        category: 'Material',
        type: 'Material Struktur',
        unit: 'Batang',
        price: 54000,
        stock: 300,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'P-003',
        name: 'Cat Eksterior 5L',
        category: 'Cat & Pelapis',
        type: 'Finishing',
        unit: 'Kaleng',
        price: 185000,
        stock: 78,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'P-004',
        name: 'Pipa PVC 3/4\"',
        category: 'Plumbing',
        type: 'Plumbing',
        unit: 'Batang',
        price: 23000,
        stock: 260,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'P-005',
        name: 'Kabel NYA 2.5mm',
        category: 'Elektrikal',
        type: 'Elektrikal',
        unit: 'Roll',
        price: 95000,
        stock: 90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'P-006',
        name: 'Keramik Lantai 40x40',
        category: 'Finishing',
        type: 'Finishing',
        unit: 'Box',
        price: 145000,
        stock: 65,
      },
    }),
  ]);

  console.log(`Produk dibuat: ${products.length}`);

  // Tim sales
  const [dewi, rizky, mira] = await Promise.all([
    prisma.salesPerson.create({
      data: {
        name: 'Dewi Lestari',
        phone: '0812-3456-7788',
        company: 'PT Cipta Bangun',
        clients: 32,
      },
    }),
    prisma.salesPerson.create({
      data: {
        name: 'Rizky Saputra',
        phone: '0821-7788-9922',
        company: 'CV Cahaya Abadi',
        clients: 24,
      },
    }),
    prisma.salesPerson.create({
      data: {
        name: 'Mira Anggraini',
        phone: '0813-6600-1144',
        company: 'PT Konstruksi Nusantara',
        clients: 19,
      },
    }),
  ]);

  console.log('Sales dibuat:', [dewi.name, rizky.name, mira.name].join(', '));

  // Pergerakan stok
  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  await Promise.all([
    prisma.stockMovement.create({
      data: {
        quantity: 80,
        receivedAt: daysAgo(1),
        productId: products[0].id,
        salesPersonId: dewi.id,
      },
    }),
    prisma.stockMovement.create({
      data: {
        quantity: 150,
        receivedAt: daysAgo(2),
        productId: products[1].id,
        salesPersonId: rizky.id,
      },
    }),
    prisma.stockMovement.create({
      data: {
        quantity: 40,
        receivedAt: daysAgo(4),
        productId: products[2].id,
        salesPersonId: mira.id,
      },
    }),
  ]);

  // Transaksi contoh
  const trx1 = await prisma.transaction.create({
    data: {
      code: 'TRX-1001',
      totalPayment: 1845000,
      change: 55000,
      totalItems: 12,
      profit: 320000,
      createdAt: now,
    },
  });

  const trx2 = await prisma.transaction.create({
    data: {
      code: 'TRX-1002',
      totalPayment: 740000,
      change: 60000,
      totalItems: 6,
      profit: 145000,
      createdAt: daysAgo(1),
    },
  });

  const trx3 = await prisma.transaction.create({
    data: {
      code: 'TRX-1003',
      totalPayment: 2560000,
      change: 40000,
      totalItems: 18,
      profit: 410000,
      createdAt: daysAgo(2),
    },
  });

  await Promise.all([
    prisma.transactionItem.createMany({
      data: [
        {
          transactionId: trx1.id,
          productId: products[0].id,
          quantity: 5,
          price: products[0].price,
          subtotal: 5 * products[0].price,
        },
        {
          transactionId: trx1.id,
          productId: products[2].id,
          quantity: 2,
          price: products[2].price,
          subtotal: 2 * products[2].price,
        },
      ],
    }),
    prisma.transactionItem.createMany({
      data: [
        {
          transactionId: trx2.id,
          productId: products[1].id,
          quantity: 4,
          price: products[1].price,
          subtotal: 4 * products[1].price,
        },
      ],
    }),
    prisma.transactionItem.createMany({
      data: [
        {
          transactionId: trx3.id,
          productId: products[3].id,
          quantity: 10,
          price: products[3].price,
          subtotal: 10 * products[3].price,
        },
        {
          transactionId: trx3.id,
          productId: products[5].id,
          quantity: 4,
          price: products[5].price,
          subtotal: 4 * products[5].price,
        },
      ],
    }),
  ]);

  console.log('Transaksi contoh dibuat.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


