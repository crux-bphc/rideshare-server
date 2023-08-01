import { Request, Response } from "express";
import { Post } from "../../entity/Post";
import { postRepository } from "../../repositories/postRepository";
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

    activePosts: z
    .boolean({
      invalid_type_error: "activePosts must be a boolean"
    })
    .optional(),

    startAtPost: z
    .number({
      invalid_type_error: "startAtPost must be an integer"
    })
    .int({
      message: "startAtPost must be an integer"
    })
    .positive({
      message: "startAtPost must be positive"
    })
    .optional(),

    endAtPost: z
    .number({
      invalid_type_error: "endAtPost must be an integer"
    })
    .int({
      message: "endAtPost must be an integer"
    })
    .positive({
      message: "endAtPost must be positive"
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
  .refine(data => new Date(data.startTime) < new Date(data.endTime),
    "startTime must occur before endTime",
  )
})

export const searchPostValidator = validate(dataSchema)

let orderingBy: object = {
  1: "post.createdAt",
  2: "post.timeRangeStart",
  3: "post.seats",
}

let orderingAlong: object = {
  0: "ASC",
  1: "DESC",
  2: "DESC",
}

export const searchPosts = async (req: Request, res: Response) => {

  let fromPlace: Place | null = req.body.fromPlace;
  let toPlace: Place | null = req.body.toPlace;
  let startTime: Date | null = req.body.startTime; // Renders trips whose timeRange is within or after startTime
  let endTime: Date | null = req.body.endTime; // Renders trips whose timeRange is within or before endTime
  // Use 1 or more here, to show only those posts which have available seats. leaving empty renders all posts without checking seats
  let availableSeats: number = req.body.availableSeats || 0;
  // true renders posts whose trips are yet to start. false renders trips which have started/finished in the past. leaving empty renders all posts regardless.
  let activePosts: boolean | null = req.body.activePosts;
  // Pagination - both numbers inclusive
  let startAtPost: number = req.body.startAtPost || 1;
  let endAtPost: number = req.body.endAtPost || 10;
  // orderBy = 1 renders posts sorted by time of posting. orderBy = 2 renders posts sorted by time of departure. orderBy = 3 renders posts sorted by number of seats available.
  // the corresponding negative numbers renders posts in descending order
  let orderBy: number = req.body.orderBy || 1;

  let searchFilter: string = "post.seats >= :availableSeats"
  let searchObj: object = {"availableSeats": availableSeats}

  if (activePosts != null) {
    searchFilter = searchFilter + " AND post.status = :activePosts";
    searchObj["activePosts"] = activePosts;
  }

  if (fromPlace != null) {
    searchFilter = searchFilter + " AND post.fromPlace = :fromPlace";
    searchObj["fromPlace"] = fromPlace;
  }

  if (toPlace != null) {
    searchFilter = searchFilter + " AND post.toPlace = :toPlace";
    searchObj["toPlace"] = toPlace;
  }

  if (startTime != null) {
    searchFilter = searchFilter + " AND post.timeRangeStop >= :startTime";
    searchObj["startTime"] = startTime;
  }

  if (endTime != null) {
    searchFilter = searchFilter + " AND post.timeRangeStart <= :endTime";
    searchObj["endTime"] = endTime;
  }

  let posts: Post[] = [];

  try {
    posts = await postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.participantQueue', 'participantQueue')
      .leftJoinAndSelect("post.originalPoster", "originalPoster")
      .leftJoinAndSelect("post.participants", "participants")
      .where(searchFilter, searchObj)
      .orderBy(orderingBy[Math.abs(orderBy)], orderingAlong[Math.sign(orderBy)+1])
      .skip(startAtPost - 1)
      .take(endAtPost - startAtPost + 1)
      .getMany()

  } catch (err: any) {
    console.log("Error while searching DB for posts." , err.message)
    return res.status(500).json({ message : "Internal Server Error"});
  }

  res.status(200).json(posts);

}
