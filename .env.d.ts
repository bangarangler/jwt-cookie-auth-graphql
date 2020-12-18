declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    ACCESS_TOKEN: string;
    REFRESH_ACCESS_TOKEN: string;
    MONGO_STRING: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_SECRET: string;
  }
}
