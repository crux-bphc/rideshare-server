import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { z } from "zod";
import { User } from "../../entity/User";

const dataSchema = z.object({
  params: z.object({
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

export const updateUserValidator = validate(dataSchema);

export const updateUser = async (req: Request, res: Response) => {
  try {
    await userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        name: req.body.name,
        // email: req.body.email,
        phNo: req.body.phNo,
        batch: req.body.batch,
      })
      .where("email = :email", { email: req.params.email })
      .execute()

    res.status(200).json("Updated user.");

  } catch (err) {
    res.status(500).json(err);
  }

};
