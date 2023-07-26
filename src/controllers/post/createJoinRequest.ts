import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";

import { z } from "zod";
import { validate } from "../../helpers/zodValidateRequest";

export const createJoinRequest = async (req: Request , res: Response) => {
    const postId = req.params.id;
    const userId = req.body.userId;

    let userObj : User | null = null;
    let postObj : Post | null = null;

    try {
        postObj = await postRepository
        .createQueryBuilder("post")
        .where("post.id = :id", { id: postId })
        .getOne()
  
        console.log(postObj)
    } catch (err : any) {
        console.log("No Post Found. Error : " , err.message)

        return res.status(500).json({ message: "Internal Server Error"})
    }

    try {
        userObj = await userRepository
            .createQueryBuilder("user")
            .where("user.id = :userId" , {userId : userId})
            .getOne()
        
        console.log(userObj)
    } catch (err : any) {
        console.log("No User Found. Error :" , err.message)

        return res.status(500).json({ message: "Internal Server Error"})
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
    
    } catch (err : any) {
    return res.json({ message: "User added to join queue" });
    }
}

