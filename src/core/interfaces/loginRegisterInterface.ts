export interface IUser {
  id: number;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface ILoginReq {
  email: string;
  password: string;
}

export interface ILoginRes {
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterReq {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}
export interface IRegisterRes {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

export interface IRefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}
