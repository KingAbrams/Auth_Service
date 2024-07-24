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
    secret: process.env.JWT_SECRET || "",
    expiresIn: "12h",
  },
};
