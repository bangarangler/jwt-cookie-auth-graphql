import { Request, Response } from "express";

// type SessionType = {
//   userId: string;
// };

export interface ServerContext {
  req: Request & { session: { userId: string } };
  res: Response;
  db: any;
  connection: any;
  redis: any;
}
