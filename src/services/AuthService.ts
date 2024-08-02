import bcrypt from "bcrypt";
import {
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IRegisterRes,
} from "../core/interfaces";
import AuthRepository from "../repositories/AuthRepositories";
import AuthTokenService from "./AuthTokenService";
import AuthTokenRepository from "../repositories/AuthTokenRepository";
import { IUser } from "../core/interfaces/loginRegisterInterface";
import { ONE_WEEK } from "../core/constants";

class AuthService {
  private authRepository: AuthRepository;
  private authTokenRepository: AuthTokenRepository;
  private authTokenService: AuthTokenService;
  constructor() {
    this.authRepository = new AuthRepository();
    this.authTokenService = new AuthTokenService();
    this.authTokenRepository = new AuthTokenRepository();
  }

  registerUser = async (data: IRegisterReq): Promise<IRegisterRes> => {
    try {
      const hashedPassword = await bcrypt.hash(data.password as string, 10);

      const user = await this.authRepository.createUser(data, hashedPassword);

      return user;
    } catch (error) {
      throw new Error(`Error creating person: ${error}`);
    }
  };

  loginUser = async (data: ILoginReq): Promise<ILoginRes | null> => {
    try {
      const user = await this.authRepository.findUserByEmail(data.email);

      if (!user) {
        return null;
      }

      const { id, email, password, firstname, lastname } = user as IUser;

      const isPasswordValid = await bcrypt.compare(data.password, password);

      if (!isPasswordValid) {
        return null;
      }

      const accessToken = this.authTokenService.generateAccessToken(id, email);
      const refreshToken = this.authTokenService.generateRefreshToken(
        id,
        email
      );

      const expiryDate = new Date(Date.now() + ONE_WEEK);

      await this.authTokenRepository.saveRefreshToken(
        id,
        refreshToken,
        expiryDate
      );

      return {
        user: { id, email, firstname, lastname },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Error loggin in user: ${error}`);
    }
  };
}

export default AuthService;
