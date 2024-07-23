import { logger } from "../../config/logger";
import { pool } from "./db";

export const checkDbConnection = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("[DATABASE] Connection established");
  } catch (error) {
    logger.error(`[DATABASE] Connection failed: ${error}`);
  }
};
