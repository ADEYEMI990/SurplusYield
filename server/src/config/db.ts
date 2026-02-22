import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  const uri = process.env.MONGO_URI as string;

  // If using an SRV connection, force known public DNS servers to avoid local resolver issues
  if (uri && uri.startsWith("mongodb+srv://")) {
    try {
      const serversEnv = process.env.FORCE_DNS_SERVERS; // optional override
      const servers = serversEnv ? serversEnv.split(",") : ["8.8.8.8", "8.8.4.4"];
      dns.setServers(servers);
      console.log("Using DNS servers:", dns.getServers());
    } catch (e) {
      console.warn("Failed to set DNS servers:", (e as Error).message);
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    // Keep process exit behavior the same as before
    process.exit(1);
  }
};

export default connectDB;
