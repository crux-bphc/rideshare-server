import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  params: z.object({
    id: z
      .string({
        invalid_type_error: "id not a string",
        required_error: "id is a required parameter",
      })
      .min(0, {
        message: "id must be a non-empty string",
      })
      .uuid({ message: "id must be a valid uuid" }),
  })
})

export const revokeRequestValidator = validate(dataSchema)

export const revokeRequest = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const userEmail = req.token.email;

  let userObj: User | null = null;
  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder("ride")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participantQueue","participantQueue")
      .where("ride.id = :rideId", { rideId })
      .getOne()

    if (!rideObj) {
      return res.status(404).json({ message: "Ride not found in DB" });
    }

  } catch (err: any) {
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
    return res.status(500).json({ message: "Internal Server Error" })
  }

  if (rideObj.originalPoster.id === userObj.id) {
    return res.status(400).json({ message: "OP cannot be removed from the join queue" });
  }

  if (!rideObj.participantQueue.includes(userObj)) {
    return res.status(400).json({ message: "User not present in the participant request queue" });
  }

  try {
    await rideRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .createQueryBuilder()
          .relation(Ride, "participantQueue")
          .of(rideObj)
          .remove(userObj)
      }
    )

  } catch (err: any) {
    return res.status(500).json({ message: "Internal Server Error" })
  }
  return res.status(200).json({ message: "User removed from Participant Queue" });
}
