import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "error", "warn"], // optional: logs all queries, errors, and warnings
});

const testConnection = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to PostgreSQL via Prisma...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    await prisma.$connect();
    console.log('✅ PostgreSQL Connected with Prisma');

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database Query Test:', result);

    // Count users
    const userCount = await prisma.user.count();
    console.log('✅ Total Users in Database:', userCount);

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Connection Failed:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

testConnection();
