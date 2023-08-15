import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

const dataSchema = z.object({
  body: z.object({
    userEmail: z
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
  }),
});

export const acceptJoinRequestValidator = validate(dataSchema);

export const acceptJoinRequest = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const OP_email = req.token.email;
  const userEmail = req.body.userEmail;

  let userObj: User | null = null;
  let postObj: Post | null = null;

  try {
    postObj = await postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.participantQueue", "participantQueue")
      .leftJoinAndSelect("post.originalPoster", "originalPoster")
      .leftJoinAndSelect("post.participants", "participants")
      .where("post.id = :id", { id: postId })
      .getOne();

    if (!postObj) {
      return res.status(404).json({ message: "Post not found in DB" });
    }

    if (postObj.participants.length >= postObj.seats) {
      return res
        .status(405)
        .json({ message: "Post participant count is full" });
    }

    if (OP_email !== postObj.originalPoster.email)
      return res.status(403).json({ message: "User is not the OP" });

    const participantQueueEmails = new Set(
      postObj.participantQueue.map((user) => user.email)
    );

    if (!participantQueueEmails.has(userEmail)) {
      return res
        .status(404)
        .json({ message: "User not found in trip's join queue" });
    }

    try {
      userObj = await userRepository
        .createQueryBuilder("user")
        .where("user.email = :userEmail", { userEmail })
        .getOne();
    } catch (err: any) {
      // console.log("Error while querying for User. Error : ", err.message)
      res.status(500).json({ message: "Internal Server Error" });
    }

    try {
      //Remove user from participantQueue
      await postRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Post, "participantQueue")
            .of(postObj)
            .remove(userObj);
        }
      );

      //Add user to participants list
      await postRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .relation(Post, "participants")
            .of(postObj)
            .add(userObj);
        }
      );
    } catch (err: any) {
      // console.log("Error adding User to Participant List. Error :", err.message)
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // console.log(userObj)
  } catch (err: any) {
    // console.log("Error while accepting join request. ", err.message)
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.json({ message: "User added to participant list" });
};
