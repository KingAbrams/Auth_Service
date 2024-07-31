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

      return {
        user: { id, email, firstname, lastname },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Error loggin in user: ${error}`);
    }
  };

  refreshToken = async (dataDecoded: UserPayload) => {
    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE id = $1 AND email = $2`,
        [dataDecoded.userId, dataDecoded.email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const { id, email } = result.rows[0];

      delete dataDecoded.iat;
      delete dataDecoded.exp;

      const accessToken = this.generateAccessToken(id, email);

      return accessToken;
    } catch (error) {
      throw new Error(`Error refreshing token: ${error}`);
    }
  };
}

export default AuthService;
