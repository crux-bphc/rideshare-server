import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";
import { generateAccessToken, generateRefreshToken } from "../../helpers/tokenHelper";
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
    const payload = await verify(req.body.token)
    
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: payload["email"] })
      .getOne();

    if (!userObj) {
      req.log.error(`User {${payload["email"]}} not found in the DB.`)
      return res.status(404).json({ message: "User not found in the DB." });
    }

    const deviceToken = req.body.deviceToken;
    const deviceTokens = userObj.deviceTokens;

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);
      await userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          deviceTokens: deviceTokens
        })
        .where("email = :email", { email: payload["email"] })
        .execute()
    }
  
    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj)

    req.log.info(`User {${payload["email"]}} logged in.`)
    return res.status(200).json({ "message": "Logged in user.", "accessToken": accessToken , "refreshToken" : refreshToken});

  } catch (err: any) {
    req.log.error(`Internal Server Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
