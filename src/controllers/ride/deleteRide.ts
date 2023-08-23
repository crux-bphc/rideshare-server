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
      return res.status(404).json({ message: "Ride not found in DB" });
    }

    if (userId == rideObj.originalPoster.id) {

      await rideRepository
        .createQueryBuilder('ride')
        .delete()
        .from(Ride)
        .where('ride.id = :id', { id: rideId })
        .execute();

      return res.json({message: "Ride deleted."});

    } else {
      res.status(401).json("Unauthorized to edit this ride.")
    }

  }
  catch (err: any) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
