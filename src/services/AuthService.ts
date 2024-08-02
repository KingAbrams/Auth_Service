import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../core/utils/db";
import {
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IRegisterRes,
} from "../core/interfaces";
import { config } from "../config";
import { UserPayload } from "../controllers/AuthController";
import { IRefreshToken } from "../core/interfaces/loginRegisterInterface";

class AuthService {
  constructor() {}

  private generateAccessToken = (id: string, email: string) => {
    const accessToken = jwt.sign(
      { userId: id, email },
      config.jwt.accessSecret,
      {
        expiresIn: config.jwt.accessExpiresIn,
      }
    );
    return accessToken;
  };

  private generateRefreshToken = (id: string, email: string) => {
    const refreshToken = jwt.sign(
      { userId: id, email },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
      }
    );
    return refreshToken;
  };

  private saveRefreshToken = async (
    userId: string,
    token: string,
    expiryDate: Date
  ) => {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiryDate]
    );
  };

  private deleteRefreshToken = async (token: string) => {
    await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
  };

  private findRefreshToken = async (token: string) => {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1`,
      [token]
    );
    return result.rows[0];
  };

  private async findUserByIdAndEmail(userId: string, email: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND email = $2`,
      [userId, email]
    );
    return result.rows[0];
  }

  registerUser = async (data: IRegisterReq): Promise<IRegisterRes> => {
    try {
      const hashedPassword = await bcrypt.hash(data.password as string, 10);

      const result = await pool.query(
        `INSERT INTO users (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING id, email, firstname, lastname`,
        [data.email, hashedPassword, data.firstname, data.lastname]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating person: ${error}`);
    }
  };

  loginUser = async (data: ILoginReq): Promise<ILoginRes | null> => {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
        data.email,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      const { id, email, password, firstname, lastname } = result.rows[0];

      const isPasswordValid = await bcrypt.compare(data.password, password);

      if (!isPasswordValid) {
        return null;
      }

      const accessToken = this.generateAccessToken(id, email);
      const refreshToken = this.generateRefreshToken(id, email);
      const sevenDay = 7 * 24 * 60 * 60 * 1000;

      const expiryDate = new Date(Date.now() + sevenDay);

      await this.saveRefreshToken(id, refreshToken, expiryDate);

      return {
        user: { id, email, firstname, lastname },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Error loggin in user: ${error}`);
    }
  };

  verifyAndRefreshToken = async (
    refreshToken: string
  ): Promise<string | null> => {
    try {
      const storedToken = await this.findRefreshToken(refreshToken);

      if (!storedToken) {
        return null;
      }

      const { expires_at } = storedToken as IRefreshToken;
      const dateNow = new Date();
      const dateExpiryStoredToken = new Date(expires_at);

      if (dateExpiryStoredToken < dateNow) {
        await this.deleteRefreshToken(refreshToken);
        return null;
      }

      const decodedData = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as UserPayload;
      const user = await this.findUserByIdAndEmail(
        decodedData.userId,
        decodedData.email
      );

      if (!user) {
        await this.deleteRefreshToken(refreshToken);
        return null;
      }

      const accesToken = this.generateAccessToken(
        decodedData.userId,
        decodedData.email
      );

      return accesToken;
    } catch (error) {
      throw new Error(`Error verifying and refreshing token: ${error}`);
    }
  };
}

export default AuthService;
