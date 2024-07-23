export interface ILoginReq {
  email: string;
  password: string;
}

export interface ILoginRes {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
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
