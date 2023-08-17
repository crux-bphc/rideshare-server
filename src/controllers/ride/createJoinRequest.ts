import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  params: z.object({
    rideId: z
      .string({
        invalid_type_error: "rideId not a string",
        required_error: "rideId is a required parameter",
      })
      .min(0, {
        message: "rideId must be a non-empty string",
      })
      .uuid({ message: "rideId must be a valid uuid" }),
  })
})

export const createJoinRequestValidator = validate(dataSchema)

export const createJoinRequest = async (req: Request, res: Response) => {
  const rideId = req.params.rideId;
  const userEmail = req.token.email;

  let userObj: User | null = null;
  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder("ride")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .where("ride.id = :rideId", { rideId })
      .getOne()

    if (!rideObj) {
      return res.status(404).json({ message: "Ride not found in DB" });
    }

  } catch (err: any) {
    // console.log("Error querying ride in DB. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :userEmail", { userEmail })
      .getOne()

    if (!userObj) {
      return res.status(404).json({ message: "User not found in DB" });
    }

  } catch (err: any) {
    // console.log("Error querying user in DB. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }

  if (rideObj.originalPoster.id === userObj.id) {
    return res.status(400).json({ message: "OP cannot be added to the join queue" });
  }

  try {
    await rideRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .createQueryBuilder()
          .relation(Ride, "participantQueue")
          .of(rideObj)
          .add(userObj);
      }
    )

  } catch (err: any) {
    // console.log("Error Adding User to Join Queue. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }
  return res.status(200).json({ message: "User Added to Join Queue" });
}
