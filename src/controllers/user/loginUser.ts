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
  const payload = await verify(req.body.token);

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: payload["email"] })
      .getOne();
  } catch (err) {
    console.log(
      "[loginUser.ts] Error in selecting user from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (!userObj) {
    return res.status(404).json({ message: "User not found in the DB." });
  }

  try {
    await userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        name: payload["name"],
        profilePicture: payload["picture"],
      })
      .where("id = :id", { id: req.token._id })
      .execute();
  } catch (err) {
    console.log(
      "[loginUser.ts] Error in updating name and pfp of user on db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  const deviceTokenVal = req.body.deviceToken;
  let existingDeviceToken: deviceToken;

  try {
    existingDeviceToken = await deviceTokenRepository
      .createQueryBuilder("deviceToken")
      .where("deviceToken.tokenId = :tokenId", { tokenId: deviceTokenVal })
      .getOne();
  } catch (err) {
    console.log(
      "[loginUser.ts] Error in searching for deviceToken in db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (existingDeviceToken !== null) {
    try {
      await deviceTokenRepository
        .createQueryBuilder()
        .update(deviceToken)
        .set({
          user: userObj,
          tokenId: deviceTokenVal,
        })
        .where("tokenId = :tokenId", { tokenId: deviceTokenVal })
        .execute();
    } catch (err) {
      console.log(
        "[loginUser.ts] Error updating user for deviceToken: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  } else {
    try {
      const deviceTokenObj = await deviceTokenRepository
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
    } catch (err) {
      console.log(
        "[loginUser.ts] Error inserting deviceToken into db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  }

  const accessToken = generateAccessToken(userObj);
  const refreshToken = generateRefreshToken(userObj);

  return res.status(200).json({
    message: "Logged in user.",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
