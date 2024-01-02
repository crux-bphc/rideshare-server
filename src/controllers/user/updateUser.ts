import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { z } from "zod";
import { User } from "../../entity/User";

const dataSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "name should be a sting",
      })
      .min(0, {
        message: "name cannot be empty",
      })
      .optional(),

    phNo: z
      .number({
        invalid_type_error: "phNo should be a number",
      })
      .int({
        message: "phNo must be an integer",
      })
      .gte(0, {
        message: "phNo must be valid",
      })
      .lte(99999999999999, {
        message: "phNo must be valid",
      })
      .optional(),

    batch: z
      .number({
        invalid_type_error: "batch should be a number",
      })
      .int({
        message: "batch must be an integer",
      })
      .min(0, {
        message: "batch must be valid",
      })
      .max(9999, {
        message: "batch must be valid",
      })
      .optional(),
  }),
});

export const updateUserValidator = validate(dataSchema);

export const updateUser = async (req: Request, res: Response) => {
  let userObj: User | null = null;

  let updateName: string | null = req.body.name;
  let updatePhNo: number | null = req.body.phNo;
  let updateBatch: number | null = req.body.batch;

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.id = :id", { id: req.token._id })
      .getOne();
  } catch (err: any) {
    console.log(
      "[updateUser.ts] Error in selecting user from db: ",
      err.message
    );
    return res.status(500).json({ message: "Internal Server Error!" });
  }

  if (!userObj) {
    return res.status(404).json({ message: "User not found in the DB." });
  }

  if (!updateName) {
    updateName = userObj.name;
  }

  if (!updatePhNo) {
    updatePhNo = userObj.phNo;
  }

  if (!updateBatch) {
    updateBatch = userObj.batch;
  }

  try {
    await userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        name: updateName,
        phNo: updatePhNo,
        batch: updateBatch,
      })
      .where("id = :id", { id: req.token._id })
      .execute();

    return res.status(200).json({ message: "Updated user." });
  } catch (err) {
    if (err.code == "23505") {
      return res
        .status(400)
        .json({ message: "Email or Phone Number already exists." });
    }
    console.log("[updateUser.ts] Error in updating user on db: ", err.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
