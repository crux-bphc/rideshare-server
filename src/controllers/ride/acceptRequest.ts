import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  body: z.object({
    userEmail: z
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

export const acceptRequestValidator = validate(dataSchema);

export const acceptRequest = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const OP_email = req.token.email;
  const userEmail = req.body.userEmail;

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
      return res.status(404).json({ message: "Ride not found in DB" });
    }

    if (rideObj.seats <= 0) {
      return res
        .status(405)
        .json({ message: "Ride participant count is full" });
    }

    if (OP_email !== rideObj.originalPoster.email)
      return res.status(403).json({ message: "User is not the OP" });

    const participantQueueEmails = new Set(
      rideObj.participantQueue.map((user) => user.email)
    );

    if (!participantQueueEmails.has(userEmail)) {
      return res
        .status(404)
        .json({ message: "User not found in trip's join queue" });
    }

    try {
      userObj = await userRepository
        .createQueryBuilder("user")
        .where("user.email = :userEmail", { userEmail })
        .getOne();
    } catch (err: any) {
      // console.log("Error while querying for User. Error : ", err.message)
      res.status(500).json({ message: "Internal Server Error" });
    }

    try {
      //Remove user from participantQueue
      await rideRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Ride, "participantQueue")
            .of(rideObj)
            .remove(userObj);
        }
      );

      //Add user to participants list
      await rideRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Ride, "participants")
            .of(rideObj)
            .add(userObj);
        }
      );

      //Update available number of seats
      await rideRepository
        .createQueryBuilder("ride")
        .update()
        .set({
          seats: rideObj.seats - 1,
        })
        .where("ride.id = :id", { id: rideId })
        .execute()

    } catch (err: any) {
      // console.log("Error adding User to Participant List. Error :", err.message)
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // console.log(userObj)
  } catch (err: any) {
    // console.log("Error while accepting join request. ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.json({ message: "User added to participant list" });
};
