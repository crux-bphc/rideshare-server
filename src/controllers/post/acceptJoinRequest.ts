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

    OP_userId: z
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

export const acceptJoinRequestValidator = validate(dataSchema)

export const acceptJoinRequest = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const OP_userId = req.body.OP_userId; //auth temp replacement
  const userId = req.body.userId

  let userObj: User | null = null;
  let postObj: Post | null = null;

  try {
    postObj = await postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.participantQueue', 'participantQueue')
      .leftJoinAndSelect("post.originalPoster", "originalPoster")
      .leftJoinAndSelect("post.participants", "participants")
      .where('post.id = :id', { id: postId })
      .getOne();

    if (!postObj) {
      return res.status(404).json({ message: "Post not found in DB" });
    }

    if (postObj.participants.length >= postObj.seats) {
      return res.status(405).json({ message: "Post participant count is full" });
    }

    if (OP_userId !== postObj.originalPoster.id)
      return res.status(403).json({ message: "User is not the OP" });

    const participantQueueIds = new Set(postObj.participantQueue.map(user => user.id));

    if (!participantQueueIds.has(userId)) {
      return res.status(404).json({ message: "User not found in trip's join queue" });
    }

    try {
      userObj = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: userId })
        .getOne()
    }
    catch (err: any) {
      console.log("Error while querying for User. Error : ", err.message)
      res.status(500).json({ message: "Internal Server Error" });
    }

    try {
      await postRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Post, "participants")
            .of(postObj)
            .add(userObj);
        }
      )
    } catch (err: any) {
      console.log("Error adding User to Participant List. Error :", err.message)
      return res.status(500).json({ message: "Internal Server Error" })
    }

    console.log(userObj)
  }
  catch (err: any) {
    console.log("Error while accepting join request. ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.json({ message: "User added to participant list" });
}
