import express from "express";
import { checkDbConnection } from "./src/core/utils/checkDb";
import router from "./src/routes";

const app = express();
checkDbConnection();

app.use(router);

export default app;
