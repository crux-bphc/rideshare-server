import type { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import type { User } from "../../entity/User";
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
});

export const findUserValidator = validate(dataSchema);

export const findUser = async (req: Request, res: Response) => {
  let userObj: (User & { message?: string }) | null = null;
  const userEmail: string = req.params.email;

  try {
    if (userEmail === req.token.email) {
      userObj = await userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.rideRequests", "rideRequests")
        .leftJoinAndSelect(
          "rideRequests.participantQueue",
          "requestParticipantQueue"
        )
        .leftJoinAndSelect(
          "rideRequests.originalPoster",
          "requestOriginalPoster"
        )
        .leftJoinAndSelect("rideRequests.participants", "requestParticipants")
        .leftJoinAndSelect("user.rides", "rides")
        .leftJoinAndSelect("rides.participantQueue", "rideParticipantQueue")
        .leftJoinAndSelect("rides.originalPoster", "rideOriginalPoster")
        .leftJoinAndSelect("rides.participants", "rideParticipants")
        .where("user.email = :email", { email: userEmail })
        .getOne();
    } else {
      userObj = await userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.rides", "rides")
        .leftJoinAndSelect("rides.originalPoster", "rideOriginalPoster")
        .leftJoinAndSelect("rides.participants", "rideParticipants")
        .where("user.email = :email", { email: userEmail })
        .getOne();
    }
  } catch (err) {
    console.log("[findUser.ts] Error in selecting user from db: ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!userObj) {
    res.status(404).json({ message: "User not found in the DB." });
    return;
  }
  userObj.id = undefined;
  userObj.message = "Found user.";

  res.status(200).json(userObj);
  return;
};
