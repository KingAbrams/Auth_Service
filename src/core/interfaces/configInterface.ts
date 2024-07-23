export interface IConfig {
  app: {
    port: number;
  };
  db: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  };
}
