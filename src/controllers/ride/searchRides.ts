import { Request, Response } from "express";
import { Ride } from "../../entity/Ride";
import { rideRepository } from "../../repositories/rideRepository";
import { Place } from "../../helpers/places";
import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  body: z.object({
    fromPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "fromPlace must be a valid enum of the defined places"
      })
      .optional(),

    toPlace: z
      .nativeEnum(Place, {
        invalid_type_error: "toPlace must be a valid enum of the defined places"
      })
      .optional(),

    startTime: z
      .coerce.date({
        invalid_type_error: "startTime must be a Date() object"
      })
      .optional(),

    endTime: z
      .coerce.date({
        invalid_type_error: "endTime must be a Date() object"
      })
      .optional(),

    availableSeats: z
      .number({
        invalid_type_error: "availableSeats must be an integer"
      })
      .int({
        message: "availableSeats must be an integer"
      })
      .nonnegative({
        message: "availableSeats must be non-negative"
      })
      .optional(),

    activeRides: z
      .boolean({
        invalid_type_error: "activeRides must be a boolean"
      })
      .optional(),

    startAtRide: z
      .number({
        invalid_type_error: "startAtRide must be an integer"
      })
      .int({
        message: "startAtRide must be an integer"
      })
      .positive({
        message: "startAtRide must be positive"
      })
      .optional(),

    endAtRide: z
      .number({
        invalid_type_error: "endAtRide must be an integer"
      })
      .int({
        message: "endAtRide must be an integer"
      })
      .positive({
        message: "endAtRide must be positive"
      })
      .optional(),

    orderBy: z
      .number({
        invalid_type_error: "orderBy must be an integer"
      })
      .int({
        message: "orderBy must be an integer"
      })
      .gte(-3, {
        message: "orderBy must be an integer in the range [-3,3]"
      })
      .lte(3, {
        message: "orderBy must be an integer in the range [-3,3]"
      })
      .optional()

  })
    .refine(data => (!(data.startTime && data.endTime) || (new Date(data.startTime) < new Date(data.endTime))),
      "startTime must occur before endTime",
    )
})

export const searchRideValidator = validate(dataSchema)

let orderingBy: object = {
  1: "ride.createdAt",
  2: "ride.timeRangeStart",
  3: "ride.seats",
}

let orderingAlong: object = {
  0: "ASC",
  1: "DESC",
  2: "DESC",
}

export const searchRides = async (req: Request, res: Response) => {

  let fromPlace: Place | null = req.body.fromPlace;
  let toPlace: Place | null = req.body.toPlace;
  let startTime: Date | null = req.body.startTime; // Renders trips whose timeRange is within or after startTime
  let endTime: Date | null = req.body.endTime; // Renders trips whose timeRange is within or before endTime
  // Use 1 or more here, to show only those rides which have available seats. leaving empty renders all rides without checking seats
  let availableSeats: number | null = req.body.availableSeats;
  // true renders rides whose trips are yet to start. false renders trips which have started/finished in the past. leaving empty renders all rides regardless.
  let activeRides: boolean | null = req.body.activeRides;
  // Pagination - both numbers inclusive
  let startAtRide: number = req.body.startAtRide || 1;
  let endAtRide: number = req.body.endAtRide || 10;
  // orderBy = 1 renders rides sorted by time of posting. orderBy = 2 renders rides sorted by time of departure. orderBy = 3 renders rides sorted by number of seats available.
  // the corresponding negative numbers renders rides in descending order
  let orderBy: number = req.body.orderBy || 1;

  let searchFilter: string = ""
  let searchObj: object = {}

  if (availableSeats != null) {
    searchFilter = searchFilter + " AND (ride.seats - (SELECT COUNT(participant) FROM UNNEST(ride.participants) AS participant)) >= :availableSeats";
    searchObj["availableSeats"] = availableSeats;
  }

  if (activeRides != null) {
    searchFilter = searchFilter + " AND ride.status = :activeRides";
    searchObj["activeRides"] = activeRides;
  }

  if (fromPlace != null) {
    searchFilter = searchFilter + " AND ride.fromPlace = :fromPlace";
    searchObj["fromPlace"] = fromPlace;
  }

  if (toPlace != null) {
    searchFilter = searchFilter + " AND ride.toPlace = :toPlace";
    searchObj["toPlace"] = toPlace;
  }

  if (startTime != null) {
    searchFilter = searchFilter + " AND ride.timeRangeStop >= :startTime";
    searchObj["startTime"] = startTime;
  }

  if (endTime != null) {
    searchFilter = searchFilter + " AND ride.timeRangeStart <= :endTime";
    searchObj["endTime"] = endTime;
  }

  if (searchFilter.length > 0) {
    searchFilter = searchFilter.substring(5,searchFilter.length);
  }

  let rides: Ride[] = [];

  try {
    rides = await rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.participantQueue', 'participantQueue')
      .leftJoinAndSelect("ride.originalPoster", "originalPoster")
      .leftJoinAndSelect("ride.participants", "participants")
      .where(searchFilter, searchObj)
      .orderBy(orderingBy[Math.abs(orderBy)], orderingAlong[Math.sign(orderBy) + 1])
      .skip(startAtRide - 1)
      .take(endAtRide - startAtRide + 1)
      .getMany()

  } catch (err: any) {
    // console.log("Error while searching DB for rides.", err.message)
    return res.status(500).json({ message: "Internal Server Error" });
  }

  res.status(200).json(rides);

}
