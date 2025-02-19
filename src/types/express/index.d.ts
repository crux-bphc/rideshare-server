import type { Token } from "../auth";

declare global {
  namespace Express {
    export interface Request {
      token?: Token;
    }
  }
}
