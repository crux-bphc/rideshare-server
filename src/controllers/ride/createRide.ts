import { Request, Response } from "express";
import { rideRepository } from "../../repositories/rideRepository";
import { Ride } from "../../entity/Ride";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";
import { Place } from "../../helpers/places";
import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  body: z.object({
    fromPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "fromPlace must be a valid enum of the defined places",
        required_error: "fromPlace is a required parameter",
      }),

    toPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "toPlace must be a valid enum of the defined places",
        required_error: "toPlace is a required parameter",
      }),

    seats: z
      .number({
        invalid_type_error: "seats must be a number",
        required_error: "seats is a required parameter",
      })
      .int({
        message: "seats must be an integer",
      })
      .positive({
        message: "seats must be a positive integer"
      }),

    timeRangeStart: z
      .coerce.date({
        invalid_type_error: "timeRangeStart must be a Date() object",
        required_error: "timeRangeStart is a required parameter",
      })
      .min(new Date(), {
        message: "timeRangeStart must occur after the time of posting"
      }),

    timeRangeStop: z
      .coerce.date({
        invalid_type_error: "timeRangeStop must be a Date() object",
        required_error: "timeRangeStop is a required parameter",
      })
      .min(new Date(), {
        message: "timeRangeStop must occur after the time of posting"
      }),

    description: z
      .string({
        invalid_type_error: "description must be a valid string"
      })
      .optional(),

  })
    .refine(data => new Date(data.timeRangeStart) <= new Date(data.timeRangeStop),
      "timeRangeStart must not occur after timeRangeStop",
    )
})

export const createRideValidator = validate(dataSchema)

export const createRide = async (req: Request, res: Response) => {
  try {

    const userObj: User = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: req.token.email }) 
      .getOne()

    if (!userObj) {
      return res.status(403).json({ message: "User not found!" });
    }

    const currentDateTime: Date = new Date();

    const newRide = await rideRepository
      .createQueryBuilder()
      .insert()
      .into(Ride)
      .values([{
        originalPoster: userObj,
        fromPlace: req.body.fromPlace,
        toPlace: req.body.toPlace,
        seats: req.body.seats,
        timeRangeStart: req.body.timeRangeStart,
        timeRangeStop: req.body.timeRangeStop,
        participants: [],
        participantQueue: [],
        status: true,
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
        description: req.body.description
      }])
      .returning("*")
      .execute()

      const ride = newRide.generatedMaps[0] as Ride;

    //Add the OP User to the particpant list
    await rideRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .createQueryBuilder()
          .relation(Ride, "participants")
          .of(ride)
          .add(userObj);
      }
    )

  return res.status(201).json({ message: "Created ride." , ride});

  } catch (err) {
    console.log("Error creating ride:", err.message)
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
