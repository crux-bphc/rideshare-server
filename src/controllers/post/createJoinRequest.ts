import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

export const createJoinRequest = async (req: Request , res: Response) => {
    const postId = req.params.postId;
    const userID = req.body.userId;

    let postOP : User | null = null;
    let postObj : Post | null = null;

    try {
        postObj = await postRepository
            .createQueryBuilder("post")
            .where("post.id = postId" , {postId : postId} )
            .getOne();
        console.log(postObj)
    } catch (err : any) {
        console.log("No Post Found. Error : " , err.message)
        return res.status(500).json({ message: "Internal Server Error"})
    }
}

