import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../helpers/tokenHelper";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { env } from "../../../config/server";

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
  const decoded = jwt.verify(req.body.refreshToken, refreshSecretKey);

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: decoded["email"] })
      .getOne();
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in selecting user from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  try {
    accessToken = generateAccessToken(userObj);
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in generating access token:",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  try {
    refreshToken = generateRefreshToken(userObj);
  } catch (err: any) {
    console.log(
      "[refreshUser.ts] Error in generating refresh token:",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  return res.status(200).json({
    message: "New tokens generated",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
