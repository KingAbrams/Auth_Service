import app from "./app";
import { config } from "./src/config";
import { logger } from "./src/config/logger";

app
  .listen(config.app, () => {
    logger.info(`[Server API] Running at PORT: ${config.app.port}`);
  })
  .on("[Server API] Server error", (error) => {
    throw new Error(error.message);
  });
