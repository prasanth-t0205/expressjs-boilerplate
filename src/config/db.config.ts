import mongoose from "mongoose";
import { logger } from "@/utils/logger";
import { env } from "@/config/env.config";

/**
 * MongoDB Connection
 * Used currently as the primary database.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.MONGO_URI;

    const conn = await mongoose.connect(mongoURI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

