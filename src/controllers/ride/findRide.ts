import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  params: z.object({
    id: z
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
  const rideId = req.params.id;

  let rideObj: Ride | null = null;

  try {
    rideObj = await rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect("ride.participantQueue", "participantQueue")
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where('ride.id = :id', { id: rideId })
      .getOne();

    if (!rideObj) {
      req.log.error(`Ride {${rideId}} not found in the DB.`)
      return res.status(404).json({ message: "Ride not found in the DB." });
    }

  }
  catch (err: any) {
    req.log.error(`Internal Server Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (rideObj.originalPoster.id != req.token._id)
    delete rideObj.participantQueue

  rideObj["message"] = "Fetched ride.";


  req.log.info(`Fetched ride {${rideId}}.`)
  return res.status(200).json(rideObj);
}
