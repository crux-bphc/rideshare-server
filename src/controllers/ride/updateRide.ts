import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";
import { Place } from "../../helpers/places";
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
      .uuid({
        message: "rideId must be a valid uuid"
      }),

  }),
  body: z.object({
    fromPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "fromPlace must be a valid enum of the defined places",
      })
      .optional(),

    toPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "toPlace must be a valid enum of the defined places",
      })
      .optional(),

    seats: z
      .number({
        invalid_type_error: "seats must be a number",
      })
      .int({
        message: "seats must be an integer",
      })
      .positive({
        message: "seats must be a positive integer"
      })
      .optional(),

    timeRangeStart: z
      .coerce.date({
        invalid_type_error: "timeRangeStart must be a Date() object",
      })
      .min(new Date(), {
        message: "timeRangeStart must occur after the time of updating"
      })
      .optional(),

    timeRangeStop: z
      .coerce.date({
        invalid_type_error: "timeRangeStop must be a Date() object",
      })
      .min(new Date(), {
        message: "timeRangeStop must occur after the time of updating"
      })
      .optional(),

    description: z
      .string({
        invalid_type_error: "description must be a valid string"
      })
      .optional(),

  })
    .refine(data => ((((!data.timeRangeStart && !data.timeRangeStop) || ((data.timeRangeStop && data.timeRangeStart) && (new Date(data.timeRangeStart) <= new Date(data.timeRangeStop)))))),
      "if one of timeRangeStart or timeRangeStop is filled, the other must be filled too; timeRangeStart must not occur after timeRangeStop"
    )
    .refine(data => ((((!data.fromPlace && !data.toPlace) || ((data.fromPlace && data.toPlace) && (data.fromPlace != data.toPlace))))),
      "if one of fromPlace or toPlace is filled, the other must be filled too; fromPlace and toPlace cannot be the same"
    )
})

export const updateRideValidator = validate(dataSchema)

export const updateRide = async (req: Request, res: Response) => {

  const rideId = req.params.id;
  const userId = req.token._id;
  let fromPlace = req.body.fromPlace;
  let toPlace = req.body.toPlace;
  let seats = req.body.seats;
  let timeRangeStart = req.body.timeRangeStart;
  let timeRangeStop = req.body.timeRangeStop;
  let description = req.body.description;

  const userObj: User = await userRepository
    .createQueryBuilder("user")
    .where("user.id = :id", { id: userId })
    .getOne()

  if (!userObj) {
    return res.status(403).json({ message: "User not found in the DB." });
  }

  const rideObj: Ride = await rideRepository
    .createQueryBuilder("ride")
    .leftJoinAndSelect("ride.originalPoster", "originalPoster")
    .where("ride.id = :id", { id: rideId })
    .getOne()

  if (!rideObj) {
    return res.status(403).json({ message: "Ride not found in the DB." });
  }

  if (fromPlace == null) {
    fromPlace = rideObj.fromPlace;
  }

  if (toPlace == null) {
    toPlace = rideObj.toPlace;
  }

  if (seats == null) {
    seats = rideObj.seats;
  }

  if (timeRangeStart == null) {
    timeRangeStart = rideObj.timeRangeStart;
  }

  if (timeRangeStop == null) {
    timeRangeStop = rideObj.timeRangeStop;
  }

  if (description == null) {
    description = rideObj.description;
  }

  try {

    if (userObj.id == rideObj.originalPoster.id) {

      const currentDateTime: Date = new Date();

      await rideRepository
        .createQueryBuilder("ride")
        .update()
        .set({
          fromPlace: req.body.fromPlace,
          toPlace: req.body.toPlace,
          seats: req.body.seats,
          timeRangeStart: req.body.timeRangeStart,
          timeRangeStop: req.body.timeRangeStop,
          status: req.body.deleteRide,
          updatedAt: currentDateTime,
          description: req.body.description
        })
        .where("ride.id = :id", { id: rideId })
        .execute()

      return res.status(200).json({ message: "Updated ride." });

    } else {
      return res.status(401).json({ message: "Unauthorized to edit this ride." })
    }

  } catch (err) {
    return res.send(500).json({ message: "Internal Server Error!" });
  }

};
