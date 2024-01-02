import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { deviceToken } from "../../entity/deviceToken";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../helpers/tokenHelper";
import { verify } from "../../helpers/googleIdVerify";

const dataSchema = z.object({
  body: z.object({
    token: z
      .string({
        invalid_type_error: "token should be a string",
        required_error: "token is a required parameter",
      })
      .min(0, {
        message: "token cannot be empty",
      }),

    deviceToken: z
      .string({
        invalid_type_error: "device_token should be a string",
        required_error: "device_token is a required parameter",
      })
      .min(0, {
        message: "device_token cannot be empty",
      }),
  }),
});

export const loginUserValidator = validate(dataSchema);

export const loginUser = async (req: Request, res: Response) => {
  let userObj: User | null = null;

  try {
    const payload = await verify(req.body.token);

    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: payload["email"] })
      .getOne();

    if (!userObj) {
      return res.status(404).json({ message: "User not found in the DB." });
    }

    const deviceTokenVal = req.body.deviceToken;

    const existingDeviceToken = await deviceTokenRepository
      .createQueryBuilder("deviceToken")
      .where("deviceToken.deviceToken = :deviceToken", {
        deviceToken: req.body.deviceToken,
      })
      .getOne();

    if (existingDeviceToken) {
      existingDeviceToken.user = userObj; //Device token already exists. Token assigned to new user.
    } else {
      const newDeviceToken = await deviceTokenRepository
        .createQueryBuilder()
        .insert()
        .into(deviceToken)
        .values([
          {
            user: userObj,
            tokenId: deviceTokenVal,
          },
        ])
        .returning("*")
        .execute();
    }

    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj);

    return res
      .status(200)
      .json({
        message: "Logged in user.",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  } catch (err: any) {
    console.log("Error while logging User in. Error : ", err.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
