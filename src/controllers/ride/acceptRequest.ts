import type { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import type { User } from "../../entity/User";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
import type { deviceToken } from "../../entity/deviceToken";
import { messaging } from "../../helpers/firebaseMessaging";
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
  const op_userId = req.token._id;
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
  } catch (err) {
    console.log(
      "[acceptRequest.ts] Error in selecting ride from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!rideObj) {
    res.status(404).json({ message: "Ride not found in the DB." });
    return;
  }

  if (rideObj.seats <= 0) {
    res.status(405).json({ message: "Ride is full." });
    return;
  }

  if (op_userId !== rideObj.originalPoster.id) {
    res
      .status(401)
      .json({ message: "Unauthorized to accept users into this ride." });
    return;
  }

  const participantQueueEmails = new Set(
    rideObj.participantQueue.map((user) => user.email)
  );

  if (!participantQueueEmails.has(userEmail)) {
    res
      .status(404)
      .json({ message: "User has not requested to join this ride." });
    return;
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :userEmail", { userEmail })
      .getOne();
  } catch (err: any) {
    console.log(
      "[acceptRequest.ts] Error in selecting user from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
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
    console.log(
      "[acceptRequest.ts] Error in removing user from participantQueue in db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  try {
    await rideRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .createQueryBuilder()
          .relation(Ride, "participants")
          .of(rideObj)
          .add(userObj);
      }
    );
  } catch (err: any) {
    console.log(
      "[acceptRequest.ts] Error in adding user to participants in db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  try {
    await rideRepository
      .createQueryBuilder("ride")
      .update()
      .set({
        seats: rideObj.seats - 1,
      })
      .where("ride.id = :id", { id: rideId })
      .execute();
  } catch (err: any) {
    console.log(
      "[acceptRequest.ts] Error in updating seats in db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  let deviceTokenObjs: deviceToken[];

  try {
    deviceTokenObjs = await deviceTokenRepository
      .createQueryBuilder("deviceToken")
      .select("deviceToken.tokenId")
      .where("deviceToken.user.id = :userId", { userId: userObj.id })
      .getMany();
  } catch (err: any) {
    console.log(
      "[acceptRequest.ts] Error in selecting deviceTokens from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  const payload = {
    notification: {
      title: `${rideObj.originalPoster.name} Accepted You into Their Ride`,
      body: "View the ride for more details.",
    },
    data: {
      action: "requestAccepted",
      userName: rideObj.originalPoster.name,
      userId: rideObj.originalPoster.id,
      rideId: rideId,
    },
    tokens: deviceTokenObjs.map((deviceToken) => deviceToken.tokenId),
  };

  try {
    messaging.sendEachForMulticast(payload);
  } catch (err: any) {
    console.log(
      "[acceptRequest.ts] Error in sending notifications: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  res.status(200).json({ message: "Accepted into this ride." });
  return;
};
