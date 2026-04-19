import app from "./app";
import { env } from "./src/config/env";
import { connectDB, disconnectDB } from "./src/config/db";
import { Server } from "http";

let server: Server | undefined;

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out. Exiting.");
    process.exit(1);
  }, 10000);

  forceExit.unref();

  if (!server) {
    disconnectDB().finally(() => process.exit(0));
    return;
  }

  server.close(() => {
    disconnectDB().finally(() => process.exit(0));
  });
};

const startServer = async () => {
  await connectDB();

  server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
