import { Request, Response } from "express";

export interface ServerContext {
  req: Request;
  res: Response;
  db: any;
  connection: any;
  redis: any;
}
