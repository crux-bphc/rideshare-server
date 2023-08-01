import * as express from "express"

import { createPost } from "../controllers/post/createPost"
import { updatePost } from "../controllers/post/updatePost"
import { createJoinRequest, createJoinRequestValidator } from "../controllers/post/createJoinRequest"
import { acceptJoinRequest, acceptJoinRequestValidator } from "../controllers/post/acceptJoinRequest"
import { findPost, findPostValidator } from "../controllers/post/findPost"
import { searchPosts } from "../controllers/post/searchPosts"

const postRouter = express.Router()

postRouter.post("/create",createPost)
postRouter.put("/update/:id",updatePost)
postRouter.post("/join/:postId",createJoinRequestValidator ,createJoinRequest)
postRouter.post("/accept/:postId",acceptJoinRequestValidator , acceptJoinRequest)
postRouter.get("/find/:postId",findPostValidator,findPost)
postRouter.get("/search",searchPosts)

export { postRouter }
