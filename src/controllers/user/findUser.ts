import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";

const dataSchema = z.object({
  params: z.object({
    id: z
      .string({
        invalid_type_error: "id not a string",
        required_error: "id is a required path parameter",
      })
      .min(0, {
        message: "id must be a non-empty string",
      })
      .uuid({ message: "id must be a valid uuid" }),
  }),
})

export const findUserValidator = validate(dataSchema);

export const findUser = async (req: Request, res: Response) => {
  try {
    const user: User = await userRepository
    .createQueryBuilder("user")
    .where("user.id = :id", {id: req.params.id})
    .getOne()

    if (!user) {
      return res.status(403).json({ message: "User doesn't exist" });
    }

    return res.status(200).json(user);

  } catch (err) {
    res.status(500).json(err);
  }
};
