import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./models/index.js";

let server;

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down MeterFlow backend...`);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    return;
  }

  await disconnectDatabase();
  process.exit(0);
}

async function startServer() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.log(`MeterFlow backend listening on port ${env.PORT}`);
  });

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      void shutdown(signal);
    });
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
  });
}

startServer().catch(async (error) => {
  console.error("Failed to start MeterFlow backend:", error);
  await disconnectDatabase();
  process.exit(1);
});
