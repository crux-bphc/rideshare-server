import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  params: z.object({
      rideId: z
        .string({
          invalid_type_error: "rideId not a string",
          required_error: "rideId is a required parameter",
        })
        .min(0, {
          message: "rideId must be a non-empty string",
        })
        .uuid({ message: "rideId must be a valid uuid" }),
    })
  })

export const findRideValidator = validate(dataSchema)

export const findRide = async (req: Request, res: Response) => {
  const rideId = req.params.rideId;

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

  }
  catch (err: any) {
    // console.log("Error while querying DB for ride. ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.json(rideObj);
}