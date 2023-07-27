import { Request, Response } from "express";
import { postRepository } from "../../repositories/postRepository";
import { Post } from "../../entity/Post";

export const findPost = async (req: Request , res: Response) => {
    const postId = req.params.postId;
    
    let postObj : Post | null = null;

    try{
        postObj = await postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.participantQueue', 'participantQueue')
            .leftJoinAndSelect("post.originalPoster", "originalPoster")
            .leftJoinAndSelect("post.participants", "participants")
            .where('post.id = :id', { id: postId })
            .getOne();

        if(!postObj){
            return res.status(404).json({ message: "Post not found in DB" });
        }
        
    }
    catch(err : any){
        console.log("Error while querying DB for post. " , err.message)
        res.status(500).json({ message: "Internal Server Error" });
    }

    return res.json(postObj);
}