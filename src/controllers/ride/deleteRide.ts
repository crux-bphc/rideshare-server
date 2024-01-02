import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
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
  })
})

export const deleteRideValidator = validate(dataSchema)

export const deleteRide = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const userId = req.token._id;

  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .where('ride.id = :id', { id: rideId })
      .getOne();

    if (!rideObj) {
      return res.status(404).json({ message: "Ride not found in the DB." });
    }

    if (userId == rideObj.originalPoster.id) {

      await rideRepository
        .createQueryBuilder('ride')
        .delete()
        .from(Ride)
        .where('ride.id = :id', { id: rideId })
        .execute();

      const joinedUserIds = rideObj.participants;

      const joinedDeviceObjs = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id IN (:...userIds)", { userIds: joinedUserIds })
        .getMany();

      const joinedUsersPayload = {
        notification: {
          title: `${rideObj.originalPoster.name} Deleted The Ride You Were Accepted Into`,
          body: "View the ride for more details.",
        },
        data: {
          action: 'rideDeleted',
          userName: rideObj.originalPoster.name,
          userId: rideObj.originalPoster.id,
          rideId: rideId,
        },
        tokens: joinedDeviceObjs.map(deviceToken => deviceToken.tokenId),
      }

      messaging.sendEachForMulticast(joinedUsersPayload);

      const requestedUserIds = rideObj.participantQueue;

      const requestedDeviceObjs = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id IN (:...userIds)", { userIds: requestedUserIds })
        .getMany();

      const requestedUsersPayload = {
        notification: {
          title: `${rideObj.originalPoster.name} Deleted The Ride You Requested To Join`,
          body: "View the ride for more details.",
        },
        data: {
          action: 'rideDeleted',
          userName: rideObj.originalPoster.name,
          userId: rideObj.originalPoster.id,
          rideId: rideId,
        },
        tokens: requestedDeviceObjs.map(deviceToken => deviceToken.tokenId),
      }

      messaging.sendEachForMulticast(requestedUsersPayload);

      return res.status(200).json({ message: "Deleted ride." });

    } else {
      return res.status(401).json({ message: "Unauthorized to delete this ride." })
    }

  }
  catch (err: any) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
}
