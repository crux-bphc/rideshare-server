import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

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
  }),
});

export const removeRequestValidator = validate(dataSchema);

export const removeRequest = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const reqUserEmail = req.token.email;
  const userEmail = req.body.email;

  let userObj: User | null = null;
  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder("ride")
      .leftJoinAndSelect("ride.participantQueue", "participantQueue")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where("ride.id = :id", { id: rideId })
      .getOne();

    if (!rideObj) {
      return res.status(404).json({ message: "Ride not found in the DB." });
    }

    if (reqUserEmail !== rideObj.originalPoster.email && reqUserEmail !== userEmail)
      return res.status(403).json({ message: "Unauthorized to remove users from this ride." });

    const participantQueueEmails = new Set(
      rideObj.participantQueue.map((user) => user.email)
    );

    if (!participantQueueEmails.has(userEmail)) {
      return res
        .status(404)
        .json({ message: "User has not requested to join this ride." });
    }

    try {
      userObj = await userRepository
        .createQueryBuilder("user")
        .where("user.email = :userEmail", { userEmail })
        .getOne();
    } catch (err: any) {
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    try {
      await rideRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Ride, "participantQueue")
            .of(rideObj)
            .remove(userObj);
        }
      );

    } catch (err: any) {
      return res.status(500).json({ message: "Internal Server Error!" });
    }

  } catch (err: any) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  return res.json({ message: "Removed from request queue." });
};