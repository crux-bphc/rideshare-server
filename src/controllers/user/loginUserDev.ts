import type { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
import { validate } from "../../helpers/zodValidateRequest";
import type { User } from "../../entity/User";
import { deviceToken } from "../../entity/deviceToken";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../helpers/tokenHelper";

const dataSchema = z.object({
  body: z.object({
    email: z
      .string({
        invalid_type_error: "email should be a string",
        required_error: "email is a required parameter",
      })
      .min(0, {
        message: "email cannot be empty",
      })
      .regex(
        /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
        {
          message: "email must be valid",
        }
      ),
  }),
});

export const loginUserDevValidator = validate(dataSchema);

export const loginUserDev = async (req: Request, res: Response) => {
  let userObj: User | null = null;

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: req.body.email })
      .getOne();
  } catch (err) {
    console.log(
      "[loginUser.ts] Error in selecting user from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!userObj) {
    res.status(404).json({ message: "User not found in the DB." });
    return;
  }

  const accessToken = generateAccessToken(userObj);
  const refreshToken = generateRefreshToken(userObj);

  res.status(200).json({
    message: "Logged in user.",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
