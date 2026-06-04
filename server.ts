import dotenv from "dotenv";
dotenv.config();

// This immediately validates the environment on boot
import { env } from "@/config/env.config";
import app from "@/app";
import { connectDB } from "@/config/db.config";
import { logger } from "@/utils/logger";

const PORT = env.PORT;

// Initialize Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(
      `[SERVER] Running in [${
        process.env.NODE_ENV || "development"
      }] mode on port: ${PORT}`
    );
  });

  // Handle Unhandled Promise Rejections
  process.on("unhandledRejection", (err: Error) => {
    logger.error("UNHANDLED REJECTION! Shutting down...", err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM (Graceful shutdown)
  process.on("SIGTERM", () => {
    logger.warn("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      logger.info("Process terminated.");
    });
  });
};

startServer();
