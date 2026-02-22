import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);

    // Get database info
    const admin = mongoose.connection.db?.admin();
    const status = await admin?.ping();
    console.log('✅ Database Ping:', status);

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Connection Failed:', errorMessage);
    process.exit(1);
  }
};

testConnection();
