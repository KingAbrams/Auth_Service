import app from "./app";
import { connectRabbitMQ } from "./rabbitmq";
import { config } from "./src/config";
import { logger } from "./src/config/logger";

app
  .listen(config.app, async () => {
    logger.info(`[Server API] Running at PORT: ${config.app.port}`);
    await connectRabbitMQ();
  })
  .on("[Server API] Server error", (error) => {
    throw new Error(error.message);
  });
