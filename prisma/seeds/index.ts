import { PrismaClient } from '@prisma/client';
import { seedSchools } from './schools.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running database seeders...');
  await seedSchools(prisma);
  console.log('✅ All seeds completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
