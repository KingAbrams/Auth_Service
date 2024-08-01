import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger";
import AuthService from "../services/AuthService";
import {
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IRegisterRes,
} from "../core/interfaces";
import { sendMessage } from "../../rabbitmq";
import { config } from "../config";

export interface UserPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

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

      if (!result) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await sendMessage(`User ${result.user.email} logged in`);

      res.status(200).json(result);

      logger.info("[CONTROLLER] Login user 'success'");
    } catch (error) {
      res.status(500).json({ message: `[Internal error]: ${error}` });

      logger.error(`[CONTROLLER] Login user 'failed': ${error}`);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({ error: "Refresh Token is not provided" });
      return;
    }

    const refreshToken = authorization.split(" ")[1];

    jwt.verify(refreshToken, config.jwt.refreshSecret, async (error, data) => {
      if (error) {
        res
          .status(401)
          .json({ message: `[Refresh Token is Invalid]: ${error}` });

        return;
      }

      const dataDecoded = data as UserPayload;

      try {
        const result = await this.authService.refreshToken(dataDecoded);

        if (!result) {
          res.status(401).json({ error: "User doesn't exist" });
          return;
        }

        res.status(200).json({
          message: `Token refreshed successfully`,
          accessToken: result,
        });
      } catch (error) {
        res.status(500).json({ message: `[Internal error]: ${error}` });

        logger.error(`[CONTROLLER] Refresh token 'failed': ${error}`);
      }
    });
  };
}

export default AuthController;
