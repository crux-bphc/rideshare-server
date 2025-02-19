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
  let deviceTokenObj: deviceToken[] | null = null;

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
      "[removeRequest.ts] Error in selecting ride from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!rideObj) {
    res.status(404).json({ message: "Ride not found in the DB." });
    return;
  }

  if (
    reqUserEmail === userEmail &&
    userEmail === rideObj.originalPoster.email
  ) {
    res.status(400).json({ message: "Cannot remove user from his own ride." });
    return;
  }

  if (
    reqUserEmail !== rideObj.originalPoster.email &&
    reqUserEmail !== userEmail
  ) {
    res
      .status(403)
      .json({ message: "Unauthorized to remove users from this ride." });
    return;
  }

  const participantQueueEmails = new Set(
    rideObj.participantQueue.map((user) => user.email)
  );

  if (!participantQueueEmails.has(userEmail)) {
    res
      .status(400)
      .json({ message: "User has not requested to join this ride." });
    return;
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :userEmail", { userEmail })
      .getOne();
  } catch (err) {
    console.log(
      "[removeRequest.ts] Error in selecting user from db: ",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (reqUserEmail === rideObj.originalPoster.email) {
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
    } catch (err) {
      console.log(
        "[removeRequest.ts] Error in removing user from participantQueue in db: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }

    try {
      deviceTokenObj = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id = :userId", { userId: userObj.id })
        .getMany();
    } catch (err) {
      console.log(
        "[removeRequest.ts] Error in finding deviceTokens from db: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }

    const payload = {
      notification: {
        title: `${rideObj.originalPoster.name} Declined Your Request to Join Their Ride `,
        body: "View the ride for more details.",
      },
      data: {
        action: "requestDeclined",
        userName: rideObj.originalPoster.name,
        userId: rideObj.originalPoster.id,
        rideId: rideId,
      },
      tokens: deviceTokenObj.map((deviceToken) => deviceToken.tokenId),
    };

    try {
      messaging.sendEachForMulticast(payload);
    } catch (err) {
      console.log(
        "[removeRequest.ts] Error in sending notifications: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }
  } else {
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
    } catch (err) {
      console.log(
        "[removeRequest.ts] Error in removing user from participantQueue in db: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }

    try {
      deviceTokenObj = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id = :userId", {
          userId: rideObj.originalPoster.id,
        })
        .getMany();
    } catch (err) {
      console.log(
        "[removeRequest.ts] Error in finding deviceTokens from db: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }

    const payload = {
      notification: {
        title: `${userObj.name} Revoked Their Request to Join Your Ride `,
        body: "View the ride for more details.",
      },
      data: {
        action: "requestDeclined",
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
        "[removeRequest.ts] Error in sending notifications: ",
        err.message
      );
      res.status(500).json({ message: "Internal Server Error!" });
      return;
    }
  }

  res.status(200).json({ message: "Removed from request queue." });
  return;
};
