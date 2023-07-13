import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";


export const updatePost = async (req: Request, res: Response) => {
  try {

    const user: User = await userRepository
    .createQueryBuilder("user")
    .where("user.id = :id", {id: req.body.userId})
    .getOne()

    if (!user) {
        res.status(403).json({ message: "User id invalid" });
    }

    const post : Post = await postRepository
    .createQueryBuilder("post")
    .where("post.id = :id", {id: req.params.id})
    .getOne()

    if (!post) {
        res.status(403).json({ message: "Post id invalid" });
    }

    if (user == post.originalPoster) {

        const currentDateTime : Date = new Date();

        await postRepository
        .createQueryBuilder("post")
        .update()
        .set({
            fromPlace: req.body.fromPlace,
            toPlace: req.body.toPlace,
            seats: req.body.seats,
            departureTime: req.body.departureTime,
            status: req.body.deletePost,
            updatedAt: currentDateTime,
            description: req.body.description
        })
        .where("post.id = :id", { id: req.params.id })
        .execute()

        res.status(200).json("Updated post.");

    } else {
        res.status(401).json("Unauthorized to edit this post.")
    }

  } catch (err) {
    res.send(500).json(err);
  }

};
