import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";
import { verify } from "../../helpers/googleIdVerify";

const dataSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "name should be a string",
        required_error: "name is a required parameter",
      })
      .min(0, {
        message: "name cannot be empty",
      }),
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

    phNo: z
      .number({
        invalid_type_error: "phNo should be a number",
        required_error: "phNo is a required parameter",
      })
      .int({
        message: "phNo must be an integer",
      })
      .gte(0, {
        message: "phNo must be valid",
      })
      .lte(99999999999999, {
        message: "phNo must be valid",
      }),
  }),
});

export const createUserDevValidator = validate(dataSchema);

export const createUserDev = async (req: Request, res: Response) => {
//   const payload = await verify(req.body.token);
  let batch: number = Number(req.body.email.substring(1, 5));

  if (Number.isNaN(batch)) {
    batch = 0;
  }

  try {
    const newUser = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          name: req.body.name,
          email: req.body.email,
          phNo: req.body.phNo,
          batch: batch,
          profilePicture: "temp_pfp",
        },
      ])
      .returning("*")
      .execute();

    return res.status(201).json({ message: "Created user." });
  } catch (err) {
    if (err.code == "23505") {
      return res
        .status(400)
        .json({ message: "Email or Phone Number already exists." });
    }
    console.log("[createUser.ts] Error in inserting user to db: ", err.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
