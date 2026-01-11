import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultUnits = [
  'Pcs',
  'Buah',
  'Kg',
  'Gram',
  'Liter',
  'Meter',
  'Box',
  'Pack',
  'Lusin',
  'Unit',
  'Set',
  'Batang',
  'Lembar',
  'Roll',
];

async function main() {
  console.log('Seeding default units...');
  
  for (const name of defaultUnits) {
    await prisma.unit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  
  console.log('Units seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
