import fs from "fs/promises";
import path from "path";
import { pool } from "./db";
import { logger } from "../../config/logger";

const runMigrations = async () => {
  try {
    const filePath = path.join(__dirname, "../../../migrations/init.sql");
    const initQuery = await fs.readFile(filePath, "utf8");
    await pool.query(initQuery);
    logger.info("[MIGRATIONS] Tables created successfully");
  } catch (error) {
    logger.error(`[MIGRATIONS] Error creating table: ${error}`);
  } finally {
    await pool.end();
  }
};

runMigrations();
