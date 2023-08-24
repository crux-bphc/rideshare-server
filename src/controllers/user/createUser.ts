import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";

const dataSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "name should be a sting",
        required_error: "name is a required paramater"
      })
      .min(0, {
        message: "name cannot be empty"
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

    batch: z
      .number({
        invalid_type_error: "batch should be a number",
        required_error: "batch is a required parameter"
      })
      .int({
        message: "batch must be an integer"
      })
      .min(0, {
        message: "batch must be valid"
      })
      .max(9999, {
        message: "batch must be valid"
      }),
  }),
});

export const createUserValidator = validate(dataSchema);

export const createUser = async (req: Request, res: Response) => {
  try {

    const newUser = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([{
        name: req.body.name,
        email: req.body.email,
        phNo: req.body.phNo,
        batch: req.body.batch,
      }])
      .returning("*")
      .execute()

      const user = newUser.generatedMaps[0] as User;

      return res.status(201).json({ message: "Created user."});

  } catch (err) {
    if (err.code == "23505") {
      return res.status(400).json({ message: "Email or Phone Number already exists." })
    }
    return res.status(500).json({ message: "Internal Server Error!" });
  }

};
