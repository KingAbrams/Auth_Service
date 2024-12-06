import dotenv from "dotenv";
import { IConfig } from "../core/interfaces";

dotenv.config();

export const config: IConfig = {
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    port: parseInt(process.env.DB_PORT || "5432", 10),
  },
  app: {
    port: parseInt(process.env.APP_PORT || "4444", 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCES_TOKEN_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET || "",
    accessExpiresIn: "1h",
    refreshExpiresIn: "7d",
  },
};
