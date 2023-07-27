import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { validate } from "../../helpers/zodValidateRequest";
import { User } from "../../entity/User";
import { z } from "zod";

const dataSchema = z.object({
  query: z.object({
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

  let userObj : User | null = null;
  
  try {
    userObj = await userRepository
                .createQueryBuilder("user")
                .where("user.id = :id", { id: req.query.id})
                .leftJoinAndSelect("user.postRequests", "postRequests")
                .leftJoinAndSelect("user.posts", "posts")
                .getOne()

    if (!userObj) {
      return res.status(404).json({ message: "User not found in DB" });
    }
    
  } catch(err : any){
    console.log("Error while querying for User. Error : ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
}
  return res.status(200).json(userObj);
};
