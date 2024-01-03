import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { User } from "../../entity/User";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
import { messaging } from "../../helpers/firebaseMessaging";
import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";
import { deviceToken } from "../../entity/deviceToken";

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

export const deleteRideValidator = validate(dataSchema);

export const deleteRide = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const userId = req.token._id;

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
      "[deleteRide.ts] Error in selecting ride from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (!rideObj) {
    return res.status(404).json({ message: "Ride not found in the DB." });
  }

  if (userId != rideObj.originalPoster.id) {
    return res
      .status(401)
      .json({ message: "Unauthorized to delete this ride." });
  }

  try {
    await rideRepository
      .createQueryBuilder("ride")
      .delete()
      .from(Ride)
      .where("ride.id = :id", { id: rideId })
      .execute();
  } catch (err) {
    console.log(
      "[deleteRide.ts] Error in deleting ride from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  const joinedUserIds = new Set(rideObj.participants.map((user) => user.id));
  joinedUserIds.delete(userId);

  if (joinedUserIds.size > 0) {
    let joinedDeviceObjs: deviceToken[];
    try {
      joinedDeviceObjs = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id IN (:...userIds)", {
          userIds: Array.from(joinedUserIds),
        })
        .getMany();
    } catch (err) {
      console.log(
        "[deleteRide.ts] Error in finding deviceTokens of participants from db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    const joinedUsersPayload = {
      notification: {
        title: `${rideObj.originalPoster.name} Deleted The Ride You Were Accepted Into`,
        body: "View the ride for more details.",
      },
      data: {
        action: "rideDeleted",
        userName: rideObj.originalPoster.name,
        userId: rideObj.originalPoster.id,
        rideId: rideId,
      },
      tokens: joinedDeviceObjs.map((deviceToken) => deviceToken.tokenId),
    };

    try {
      messaging.sendEachForMulticast(joinedUsersPayload);
    } catch (err) {
      console.log(
        "[deleteRide.ts] Error in sending notifications to participants: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  }

  const requestedUserIds = new Set(
    rideObj.participantQueue.map((user) => user.id)
  );

  if (requestedUserIds.size > 0) {
    let requestedDeviceObjs: deviceToken[];
    try {
      requestedDeviceObjs = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id IN (:...userIds)", {
          userIds: Array.from(requestedUserIds),
        })
        .getMany();
    } catch (err) {
      console.log(
        "[deleteRide.ts] Error in finding deviceTokens of participantQueue from db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    const requestedUsersPayload = {
      notification: {
        title: `${rideObj.originalPoster.name} Deleted The Ride You Requested To Join`,
        body: "View the ride for more details.",
      },
      data: {
        action: "rideDeleted",
        userName: rideObj.originalPoster.name,
        userId: rideObj.originalPoster.id,
        rideId: rideId,
      },
      tokens: requestedDeviceObjs.map((deviceToken) => deviceToken.tokenId),
    };

    try {
      messaging.sendEachForMulticast(requestedUsersPayload);
    } catch (err) {
      console.log(
        "[deleteRide.ts] Error in sending notifications to participantQueue: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  }

  return res.status(200).json({ message: "Deleted ride." });
};
