import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { env } from "../../config/server";
import { tokenType } from "../types/auth";

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    const accessSecretKey = env.ACCESS_JWT_SECRET;

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, accessSecretKey);
    const tokenValidateResult = tokenType.safeParse(decoded);
    if (tokenValidateResult.success === false) {
      throw new Error("Token is malformed.");
    }
    req.token = tokenValidateResult.data;

    next();
  } catch (err) {
    res.status(401).send("Token expired/User not logged in.");
  }
};
