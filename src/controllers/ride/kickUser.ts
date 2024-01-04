import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";
import { deviceTokenRepository } from "../../repositories/deviceTokenRepository";
import { deviceToken } from "../../entity/deviceToken";
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

export const kickUserValidator = validate(dataSchema);

export const kickUserRequest = async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const reqUserEmail = req.token.email;
  const userEmail = req.body.email;

  let userObj: User | null = null;
  let rideObj: Ride | null = null;
  let deviceTokenObj: deviceToken[] | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder("ride")
      // .leftJoinAndSelect("ride.participantQueue", "participantQueue")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where("ride.id = :id", { id: rideId })
      .getOne();
  } catch (err) {
    console.log(
      "[kickUser.ts] Error in selecting ride from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (!rideObj) {
    return res.status(404).json({ message: "Ride not found in the DB." });
  }

  if (reqUserEmail == userEmail && userEmail == rideObj.originalPoster.email)
    return res
      .status(400)
      .json({ message: "Cannot kick user from his own ride." });

  if (
    reqUserEmail !== rideObj.originalPoster.email &&
    reqUserEmail !== userEmail
  )
    return res
      .status(403)
      .json({ message: "Unauthorized to kick users from this ride." });

  const participantEmails = new Set(
    rideObj.participants.map((user) => user.email)
  );

  if (!participantEmails.has(userEmail)) {
    return res
      .status(400)
      .json({ message: "User has not been accepted into this ride." });
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :userEmail", { userEmail })
      .getOne();
  } catch (err) {
    console.log(
      "[kickUser.ts] Error in selecting user from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (reqUserEmail == rideObj.originalPoster.email) {
    try {
      await rideRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Ride, "participants")
            .of(rideObj)
            .remove(userObj);
        }
      );
    } catch (err) {
      console.log(
        "[kickUser.ts] Error in removing user from participants in db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    try {
      await rideRepository
        .createQueryBuilder("ride")
        .update()
        .set({
          seats: rideObj.seats + 1,
        })
        .where("ride.id = :id", { id: rideId })
        .execute();
    } catch (err: any) {
      console.log(
        "[kickUser.ts] Error in updating seats in db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  
    try {
      deviceTokenObj = await deviceTokenRepository
        .createQueryBuilder("deviceToken")
        .select("deviceToken.tokenId")
        .where("deviceToken.user.id = :userId", { userId: userObj.id })
        .getMany();
    } catch (err) {
      console.log(
        "[kickUser.ts] Error in finding deviceTokens from db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    const payload = {
      notification: {
        title: `${rideObj.originalPoster.name} Removed You From Their Ride`,
        body: "View the ride for more details.",
      },
      data: {
        action: "userKicked",
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
        "[kickUser.ts] Error in sending notifications: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  } else {
    try {
      await rideRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Ride, "participants")
            .of(rideObj)
            .remove(userObj);
        }
      );
    } catch (err) {
      console.log(
        "[kickUser.ts] Error in removing user from participants in db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

  try {
    await rideRepository
      .createQueryBuilder("ride")
      .update()
      .set({
        seats: rideObj.seats + 1,
      })
      .where("ride.id = :id", { id: rideId })
      .execute();
  } catch (err: any) {
    console.log(
      "[kickUser.ts] Error in updating seats in db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
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
        "[kickUser.ts] Error in finding deviceTokens from db: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }

    const payload = {
      notification: {
        title: `${userObj.name} Removed Themselves From Your Ride`,
        body: "View the ride for more details.",
      },
      data: {
        action: "userRemoved",
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
        "[kickUser.ts] Error in sending notifications: ",
        err.message
      );
      return res.status(500).json({ message: "Internal Server Error!" });
    }
  }

  return res.status(200).json({ message: "Removed from ride participants." });
};
