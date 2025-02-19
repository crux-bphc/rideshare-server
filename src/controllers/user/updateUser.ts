import type { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { z } from "zod";
import { User } from "../../entity/User";
import { verify } from "../../helpers/googleIdVerify";
import type { AdditionalClaims } from "../../types/auth";

const dataSchema = z.object({
  body: z.object({
    token: z
      .string({
        invalid_type_error: "token should be a string",
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

    profilePicture: z
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
  }),
});

export const updateUserValidator = validate(dataSchema);

export const updateUser = async (req: Request, res: Response) => {
  let userObj: User | null = null;
  const payload: AdditionalClaims | null = req.body.token
    ? await verify(req.body.token)
    : null;

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
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }

  if (!userObj) {
    res.status(404).json({ message: "User not found in the DB." });
    return;
  }

  let updateName: string;
  let updateEmail: string;
  let updatePhNo: number | null = req.body.phNo;
  let updateProfilePicture: string | null;

  if (payload !== null) {
    updateName = payload.name;
    updateEmail = payload.email;
    updateProfilePicture = payload.picture;
  } else {
    updateName = userObj.name;
    updateEmail = userObj.email;
    updateProfilePicture = userObj.profilePicture;
  }

  if (req.body.phNo !== null) {
    updatePhNo = req.body.phNo;
  } else {
    updatePhNo = userObj.phNo;
  }

  try {
    await userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        name: updateName,
        email: updateEmail,
        phNo: updatePhNo,
        profilePicture: updateProfilePicture,
      })
      .where("id = :id", { id: req.token._id })
      .execute();

    res.status(200).json({ message: "Updated user." });
    return;
  } catch (err) {
    if (err.code === "23505") {
      res
        .status(400)
        .json({ message: "Email or Phone Number already exists." });
      return;
    }
    console.log("[updateUser.ts] Error in updating user on db: ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
    return;
  }
};
