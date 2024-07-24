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

class AuthService {
  constructor() {}
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

      const token = jwt.sign({ userId: id, email }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return { user: { id, email, firstname, lastname }, token: token };
    } catch (error) {
      throw new Error(`Error loggin in user: ${error}`);
    }
  };
}

export default AuthService;
