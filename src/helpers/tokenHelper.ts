import jwt from "jsonwebtoken";
import { User } from "../entity/User";

import "dotenv/config";
import { env } from "../../config/server";

const secretKey = env.JWT_SECRET;

export const generateAccessToken = (userObj: User) => {
  const tokenPayload = {
    _id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    phNo: userObj.phNo,
    batch: userObj.batch,
  };

  const tokenOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  };

  const token = jwt.sign(tokenPayload, secretKey, tokenOptions);

  return token;
};

export const generateRefreshToken = (userObj: User) => {
  const tokenPayload = {
    _id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    phNo: userObj.phNo,
    batch: userObj.batch,
  };

  const tokenOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  };

  const token = jwt.sign(tokenPayload, secretKey, tokenOptions);

  return token;
};