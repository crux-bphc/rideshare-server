import { AppDataSource } from "../data-source";
import { Post } from "../entity/Post";

export const postRepository = AppDataSource.getRepository(Post);
