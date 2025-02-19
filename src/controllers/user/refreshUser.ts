import type { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import type { User } from "../../entity/User";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../helpers/tokenHelper";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { env } from "../../../config/server";
import { Token, tokenType } from "../../types/auth";

const dataSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        invalid_type_error: "refresh token should be a string",
        required_error: "refresh token is a required parameter",
      })
      .min(0, {
        message: "refresh token cannot be empty",
      }),
  }),
});

export const refreshUserValidator = validate(dataSchema);

export const refreshUser = async (req: Request, res: Response) => {
  let userObj: User | null = null;
  let accessToken: string;
  let refreshToken: string;

  const refreshSecretKey = env.REFRESH_JWT_SECRET;
  let decoded: string | JwtPayload;
  let decodedToken: Token;

  try {
    decoded = jwt.verify(req.body.refreshToken, refreshSecretKey);
    const tokenValidateResult = tokenType.safeParse(decoded);
    if (tokenValidateResult.success === false) {
      throw new Error("Token is malformed.");
    }
    decodedToken = tokenValidateResult.data;
  } catch (err) {
    console.log("[refreshUser.ts] Error verifying token: ", err.message);
    res.status(403).json({ message: "Invalid Token!" });
    return;
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: decodedToken.email })
      .getOne();
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in selecting user from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  try {
    accessToken = generateAccessToken(userObj);
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in generating access token: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  try {
    refreshToken = generateRefreshToken(userObj);
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in generating refresh token: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  res.status(200).json({
    message: "New tokens generated",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
