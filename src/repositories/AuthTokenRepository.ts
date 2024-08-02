import { pool } from "../core/utils/db";

class AuthTokenRepository {
  constructor() {}

  saveRefreshToken = async (
    userId: number,
    token: string,
    expiryDate: Date
  ) => {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiryDate]
    );
  };

  deleteRefreshToken = async (token: string) => {
    await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
  };

  findRefreshToken = async (token: string) => {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1`,
      [token]
    );

    return result.rows[0];
  };
}
export default AuthTokenRepository;
