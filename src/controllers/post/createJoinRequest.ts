import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

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
      .uuid({ message: "userId must be a valid uuid" }),
  }),
  params: z.object({
    postId: z
      .string({
        invalid_type_error: "postId not a string",
        required_error: "postId is a required parameter",
      })
      .min(0, {
        message: "postId must be a non-empty string",
      })
      .uuid({ message: "postId must be a valid uuid" }),
  })
})

export const createJoinRequestValidator = validate(dataSchema)

export const createJoinRequest = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userId = req.body.userId;

  let userObj: User | null = null;
  let postObj: Post | null = null;

  try {
    postObj = await postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.originalPoster", "originalPoster")
      .where("post.id = :postId", { postId })
      .getOne()

    if (!postObj) {
      return res.status(404).json({ message: "Post not found in DB" });
    }

  } catch (err: any) {
    // console.log("Error querying post in DB. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }

  try {
    userObj = await userRepository
      .createQueryBuilder("user")
      .where("user.id = :userId", { userId })
      .getOne()

    if (!userObj) {
      return res.status(404).json({ message: "User not found in DB" });
    }

  } catch (err: any) {
    // console.log("Error querying user in DB. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }

  if (postObj.originalPoster.id === userObj.id) {
    return res.status(400).json({ message: "OP cannot be added to the join queue" });
  }

  try {
    await postRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .createQueryBuilder()
          .relation(Post, "participantQueue")
          .of(postObj)
          .add(userObj);
      }
    )

  } catch (err: any) {
    // console.log("Error Adding User to Join Queue. Error :", err.message)
    return res.status(500).json({ message: "Internal Server Error" })
  }
  return res.status(200).json({ message: "User Added to Join Queue" });
}
