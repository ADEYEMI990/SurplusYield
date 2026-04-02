import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected with Prisma");
  } catch (error) {
    console.error(`❌ Database Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;