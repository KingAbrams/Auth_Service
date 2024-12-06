import { Request, Response } from "express";
import { logger } from "../config/logger";
import AuthService from "../services/AuthService";
import {
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IRegisterRes,
} from "../core/interfaces";
import { sendMessage } from "../../rabbitmq";
import AuthTokenService from "../services/AuthTokenService";
import { ONE_WEEK } from "../core/constants";

export interface UserPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

class AuthController {
  private authService: AuthService;
  private authTokenService: AuthTokenService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.authTokenService = new AuthTokenService();
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

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: ONE_WEEK,
      });

      res.status(200).json(result);

      logger.info("[CONTROLLER] Login user 'success'");
    } catch (error) {
      res.status(500).json({ message: `[Internal error]: ${error}` });

      logger.error(`[CONTROLLER] Login user 'failed': ${error}`);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh Token is not provided" });
      return;
    }

    try {
      const accessToken = await this.authTokenService.verifyAndRefreshToken(
        refreshToken
      );

      if (!accessToken) {
        res.status(401).json({
          message: "[Refresh Token is Invalid] or [User doesn't exist]",
        });
        return;
      }

      res.status(200).json({
        message: `Token refreshed successfully`,
        accessToken,
      });
    } catch (error) {
      res.status(500).json({ message: `[Internal error]: ${error}` });

      logger.error(`[CONTROLLER] Refresh token 'failed': ${error}`);
    }
  };
}

export default AuthController;
