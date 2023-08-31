import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";
import { verify } from "../../helpers/googleIdVerify";

const dataSchema = z.object({
  body: z.object({
    token: z
    .string({
      invalid_type_error: "token should be a string",
      required_error: "token is a required parameter",
    }),

    phNo: z
      .number({
        invalid_type_error: "phNo should be a number",
        required_error: "phNo is a required parameter"
      })
      .int({
        message: "phNo must be an integer"
      })
      .gte(0, {
        message: "phNo must be valid"
      })
      .lte(99999999999999, {
        message: "phNo must be valid"
      }),
  }),
});

export const createUserValidator = validate(dataSchema);

export const createUser = async (req: Request, res: Response) => {
  try {
    const payload = await verify(req.body.token)
    let batch: number = Number(payload["email"].substring(1,5))

    if (Number.isNaN(batch)) {
      batch = 0;
    }

    const newUser = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([{
        name: payload["name"],
        email: payload["email"],
        phNo: req.body.phNo,
        batch: batch,
        profilePicture: payload["picture"]
      }])
      .returning("*")
      .execute()

    return res.status(201).json({ message: "Created user." });

  } catch (err) {
    if (err.code == "23505") {
      return res.status(400).json({ message: "Email or Phone Number already exists." })
    }
    return res.status(500).json({ message: "Internal Server Error!" });
  }

};
