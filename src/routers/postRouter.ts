import * as express from "express";

import {
  createPost,
  createPostValidator,
} from "../controllers/post/createPost";

import {
  updatePost,
  updatePostValidator,
} from "../controllers/post/updatePost";

import {
  createJoinRequest,
  createJoinRequestValidator,
} from "../controllers/post/createJoinRequest";

import {
  acceptJoinRequest,
  acceptJoinRequestValidator,
} from "../controllers/post/acceptJoinRequest";

import { 
    findPost, 
    findPostValidator 
} from "../controllers/post/findPost";

import {
  searchPosts,
  searchPostValidator,
} from "../controllers/post/searchPosts";

import { isLoggedIn } from "../middleware/auth";

const postRouter = express.Router();

postRouter.post("/create", createPostValidator,isLoggedIn ,createPost);
postRouter.put("/update/:id", updatePostValidator,isLoggedIn ,updatePost);
postRouter.post("/join/:postId", createJoinRequestValidator,isLoggedIn ,createJoinRequest);
postRouter.post("/accept/:postId", acceptJoinRequestValidator,isLoggedIn,acceptJoinRequest);
postRouter.get("/find/:postId", findPostValidator,isLoggedIn ,findPost);
postRouter.get("/search", searchPostValidator,isLoggedIn ,searchPosts);

export { postRouter };
