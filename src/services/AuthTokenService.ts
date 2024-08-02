import jwt from "jsonwebtoken";
import { config } from "../config";
import AuthTokenRepository from "../repositories/AuthTokenRepository";
import { IRefreshToken } from "../core/interfaces/loginRegisterInterface";
import { UserPayload } from "../controllers/AuthController";
import AuthRepository from "../repositories/AuthRepositories";

class AuthTokenService {
  private authTokenRepository: AuthTokenRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.authTokenRepository = new AuthTokenRepository();
    this.authRepository = new AuthRepository();
  }

  generateAccessToken = (id: number, email: string) => {
    const accessToken = jwt.sign(
      { userId: id, email },
      config.jwt.accessSecret,
      {
        expiresIn: config.jwt.accessExpiresIn,
      }
    );

    return accessToken;
  };

  generateRefreshToken = (id: number, email: string) => {
    const refreshToken = jwt.sign(
      { userId: id, email },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
      }
    );

    return refreshToken;
  };

  verifyAndRefreshToken = async (
    refreshToken: string
  ): Promise<string | null> => {
    try {
      const storedToken = await this.authTokenRepository.findRefreshToken(
        refreshToken
      );

      if (!storedToken) {
        return null;
      }

      const { expires_at } = storedToken as IRefreshToken;
      const dateNow = new Date();
      const dateExpiryStoredToken = new Date(expires_at);

      if (dateExpiryStoredToken < dateNow) {
        await this.authTokenRepository.deleteRefreshToken(refreshToken);
        return null;
      }

      const decodedData = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as UserPayload;

      const user = await this.authRepository.findUserByIdAndEmail(
        decodedData.userId,
        decodedData.email
      );

      if (!user) {
        await this.authTokenRepository.deleteRefreshToken(refreshToken);
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
export default AuthTokenService;
