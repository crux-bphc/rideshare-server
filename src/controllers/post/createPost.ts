import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";
import { Place } from "../../helpers/places";
import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  body: z.object({
    userId: z
      .string({
        invalid_type_error: "userId not a string",
        required_error: "userId is a required parameter",
      })
      .min(0, {
        message: "userId must be a non-empty string",
      })
      .uuid({
        message: "userId must be a valid uuid"
      }),

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
  .refine(data => new Date(data.timeRangeStart) < new Date(data.timeRangeStop),
    "timeRangeStart must occur before timeRangeStop",
  )
})

export const createPostValidator = validate(dataSchema)

export const createPost = async (req: Request, res: Response) => {
  try {

    const user: User = await userRepository
      .createQueryBuilder("user")
      .where("user.id = :id", { id: req.body.userId })
      .getOne()

    if (!user) {
      return res.status(403).json({ message: "User not found!" });
    }

    console.log(user)
    const currentDateTime: Date = new Date();

    await postRepository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values([{
        originalPoster: user,
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
      .execute()

  } catch (err) {
    console.log("Error creating post:" , err.message)
    return res.status(500).json({ message : "Internal Server Error"});
  }

  return res.status(200).json({message : "Created post."});
};
