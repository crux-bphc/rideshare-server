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
})

export const updateRideValidator = validate(dataSchema)

export const updateRide = async (req: Request, res: Response) => {
  try {

    const rideId = req.params.id;

    const user: User = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: req.body.email })
      .getOne()

    if (!user) {
      res.status(403).json({ message: "User not found!" });
    }

    const ride: Ride = await rideRepository
      .createQueryBuilder("ride")
      .where("ride.id = :id", { id: rideId })
      .getOne()

    if (!ride) {
      res.status(403).json({ message: "Ride id invalid" });
    }

    if (user == ride.originalPoster) {

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

      res.status(200).json("Updated ride.");

    } else {
      res.status(401).json("Unauthorized to edit this ride.")
    }

  } catch (err) {
    res.send(500).json(err);
  }

};
