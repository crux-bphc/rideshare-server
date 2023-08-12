import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";

const dataSchema = z.object({
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
  }),
})

export const findUserValidator = validate(dataSchema);

export const findUser = async (req: Request, res: Response) => {

  let userObj: User | null = null;

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.postRequests", "postRequests")
      .leftJoinAndSelect("postRequests.participantQueue", "postReqParticipantQueue")
      .leftJoinAndSelect("postRequests.originalPoster", "postReqOriginalPoster")
      .leftJoinAndSelect("postRequests.participants", "postReqParticipants")
      .leftJoinAndSelect("user.posts", "posts")
      .leftJoinAndSelect("posts.participantQueue", "postParticipantQueue")
      .leftJoinAndSelect("posts.originalPoster", "postOriginalPoster")
      .leftJoinAndSelect("posts.participants", "postParticipants")
      .where("user.email = :email", { email: req.body.email })
      .getOne()

    if (!userObj) {
      return res.status(404).json({ message: "User not found in DB" });
    }

  } catch (err: any) {
    console.log("Error while querying for User. Error : ", err.message)
    return res.status(500).json({ message: "Internal Server Error" });
  }
  return res.json(userObj);
}