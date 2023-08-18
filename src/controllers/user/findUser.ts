import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";

const dataSchema = z.object({
  params: z.object({
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
})

export const findUserValidator = validate(dataSchema);

export const findUser = async (req: Request, res: Response) => {

  let userObj: User | null = null;

  try {

    // Once tokens work, match ID with user email inside DB 
    // return full user details if they match (or if no email is passed)
    // In case they don't match, return limited details about the user

    userObj = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.rideRequests", "rideRequests")
      .leftJoinAndSelect("user.rides", "rides")
      .leftJoinAndSelect('rides.participantQueue', 'participantQueue')
      .leftJoinAndSelect("rides.originalPoster", "originalPoster")
      .leftJoinAndSelect("rides.participants", "participants")
      .where("user.email = :email", { email: req.params.email })
      .getOne()

    if (!userObj) {
      return res.status(404).json({ message: "User not found in DB" });
    }

  } catch (err: any) {
    console.log("Error while querying for User. Error : ", err.message)
    return res.status(500).json({ message: "Internal Server Error" });
  }
  return res.json(userObj);
}