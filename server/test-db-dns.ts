import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Force resolver to Google DNS for this process
dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log('Using DNS servers:', dns.getServers());

const testConnection = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to MongoDB using forced DNS...');
    console.log('URI:', process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI as string, { connectTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected:', mongoose.connection.host);

    const admin = mongoose.connection.db?.admin();
    const status = await admin?.ping();
    console.log('✅ Database Ping:', status);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Connection Failed:', errorMessage);
    process.exit(1);
  }
};

testConnection();
