import { Request, Response } from "express";
import { logger } from "../config/logger";
import AuthService from "../services/AuthService";
import {
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IRegisterRes,
} from "../core/interfaces";

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstname, lastname } = req.body;

      if (!email || !password || !firstname || !lastname) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const user: IRegisterReq = {
        email,
        password,
        firstname,
        lastname,
      };

      const newUser: IRegisterRes = await this.authService.registerUser(user);

      res.status(201).json(newUser);

      logger.info("[CONTROLLER] Creating user 'success'");
    } catch (error) {
      res.status(500).json({ message: `[Internal error]: ${error}` });

      logger.error(`[CONTROLLER] Creating user 'failed': ${error}`);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const user: ILoginReq = {
        email,
        password,
      };

      const result: ILoginRes | null = await this.authService.loginUser(user);

      logger.info(`[CONTROLLER ] ROWS : ${JSON.stringify(result)}`);

      if (!result) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      res.status(200).json(result);

      logger.info("[CONTROLLER] Login user 'success'");
    } catch (error) {
      res.status(500).json({ message: `[Internal error]: ${error}` });

      logger.error(`[CONTROLLER] Login user 'failed': ${error}`);
    }
  };
}

export default AuthController;
