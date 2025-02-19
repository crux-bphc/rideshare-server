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

export const createRequestValidator = validate(dataSchema);

export const createRequest = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const userId = req.token._id;

  let userObj: User | null = null;
  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder("ride")
      .leftJoinAndSelect("ride.participantQueue", "participantQueue")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where("ride.id = :rideId", { rideId })
      .getOne();
  } catch (err) {
    console.log(
      "[createRequest.ts] Error in selecting ride from db: ",
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

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.id = :userId", { userId })
      .getOne();
  } catch (err) {
    console.log(
      "[createRequest.ts] Error in selecting user from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!userObj) {
    res.status(404).json({ message: "User not found in the DB." });
    return;
  }

  if (rideObj.originalPoster.id === userObj.id) {
    res.status(400).json({ message: "Cannot request to join your own ride." });
    return;
  }

  const participantQueueIds = new Set(
    rideObj.participantQueue.map((user) => user.id)
  );

  if (participantQueueIds.has(userId)) {
    res
      .status(400)
      .json({ message: "User has already requested to join this ride." });
    return;
  }

  const participantIds = new Set(rideObj.participants.map((user) => user.id));

  if (participantIds.has(userId)) {
    res
      .status(400)
      .json({ message: "User has already been accepted into this ride." });
    return;
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
    );
  } catch (err) {
    console.log(
      "[createRequest.ts] Error in adding user to participantQueue in db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  let deviceTokenObj: deviceToken[];

  try {
    deviceTokenObj = await deviceTokenRepository
      .createQueryBuilder("deviceToken")
      .select("deviceToken.tokenId")
      .where("deviceToken.user.id = :userId", {
        userId: rideObj.originalPoster.id,
      })
      .getMany();
  } catch (err: any) {
    console.log(
      "[createRequest.ts] Error in selecting deviceTokens from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }
  const payload = {
    notification: {
      title: `${userObj.name} Requested to Join Your Ride`,
      body: "Review their request to join your ride.",
    },
    data: {
      action: "rideRequest",
      userName: userObj.name,
      userId: userObj.id,
      rideId: rideId,
    },
    tokens: deviceTokenObj.map((deviceToken) => deviceToken.tokenId),
  };

  try {
    messaging.sendEachForMulticast(payload);
  } catch (err) {
    console.log(
      "[createRequest.ts] Error in sending notifications: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  res.status(200).json({ message: "Requested to join this ride." });
  return;
};
