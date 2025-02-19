import jwt from "jsonwebtoken";
import type { User } from "../entity/User";
import "dotenv/config";
import { env } from "../../config/server";
import type { Token } from "../types/auth";

export const generateAccessToken = (userObj: User) => {
  const accessSecretKey = env.ACCESS_JWT_SECRET;

  const tokenPayload = {
    _id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    phNo: userObj.phNo,
    batch: userObj.batch,
  } as Token;

  const token = jwt.sign(tokenPayload, accessSecretKey, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });

  return token;
};

export const generateRefreshToken = (userObj: User) => {
  const refreshSecretKey = env.REFRESH_JWT_SECRET;

  const tokenPayload = {
    _id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    phNo: userObj.phNo,
    batch: userObj.batch,
  };

  const token = jwt.sign(tokenPayload, refreshSecretKey, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });

  return token;
};
