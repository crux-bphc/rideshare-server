import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";

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

  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.participantQueue', 'participantQueue')
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where('ride.id = :id', { id: rideId })
      .getOne();

    if (!rideObj) {
      return res.status(404).json({ message: "Ride not found in DB" });
    }

    await rideRepository
      .createQueryBuilder('ride')
      .delete()
      .from(Ride)
      .where('ride.id = :id', { id: rideId })
      .execute();

  }
  catch (err: any) {
    // console.log("Error while querying DB for ride. ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.json({message: "Ride deleted."});
}
