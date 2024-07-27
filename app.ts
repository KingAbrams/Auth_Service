import express from "express";
import multer from "multer";
import cors from "cors";
import { checkDbConnection } from "./src/core/utils/checkDb";
import router from "./src/routes";

const app = express();
const upload = multer();
checkDbConnection();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use(router);

export default app;
