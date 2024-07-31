import { Router, Request, Response } from "express";
import AuthController from "../controllers/AuthController";
import AuthService from "../services/AuthService";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Auth Service");
});

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/refreshToken", authController.refreshToken);

export default router;
