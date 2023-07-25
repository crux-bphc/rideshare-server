import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";


export const createPost = async (req: Request, res: Response) => {
  try {

    const user: User = await userRepository
      .createQueryBuilder("user")
      .where("user.id = :id", { id: req.body.userId })
      .getOne()

    if (!user) {
      res.status(403).json({ message: "User id invalid" });
    }
    
    console.log(user)
    const currentDateTime: Date = new Date();

    await postRepository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values([{
        originalPoster: user,
        fromPlace: req.body.fromPlace,
        toPlace: req.body.toPlace,
        seats: req.body.seats,
        timeRangeStart: req.body.timeRangeStart,
        timeRangeStop: req.body.timeRangeStop,
        participants: [],
        requestQueue: [],
        status: true,
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
        description: req.body.description
      }])
      .execute()

  } catch (err) {
    console.log("Error creating post:" , err.message)
    return res.status(500).json({ message : "Internal Server Error"});
  }

  return res.status(200).json({message : "Created post."});
};
