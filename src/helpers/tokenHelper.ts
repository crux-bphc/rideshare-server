import jwt from "jsonwebtoken";
import { User } from "../entity/User";

import "dotenv/config";
import { env } from "../../config/server";

const secretKey = env.JWT_SECRET;

export const generateToken = (userObj: User) => {
  const tokenPayload = {
    _id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    phNo: userObj.phNo,
    batch: userObj.batch,
  };

  const tokenOptions = {
    expiresIn: "30 days",
  };

  const token = jwt.sign(tokenPayload, secretKey, tokenOptions);

  return token;
};
