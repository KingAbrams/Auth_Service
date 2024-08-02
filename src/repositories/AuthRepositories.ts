import { IRegisterReq } from "../core/interfaces";
import { pool } from "../core/utils/db";

class AuthRepository {
  constructor() {}

  async createUser(data: IRegisterReq, hashedPassword: string) {
    const result = await pool.query(
      `INSERT INTO users (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING id, email, firstname, lastname`,
      [data.email, hashedPassword, data.firstname, data.lastname]
    );

    return result.rows[0];
  }

  async findUserByIdAndEmail(userId: number, email: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND email = $2`,
      [userId, email]
    );

    return result.rows[0];
  }

  async findUserByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    return result.rows[0];
  }
}
export default AuthRepository;
