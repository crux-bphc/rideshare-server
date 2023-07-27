import * as express from "express"

import { createPost } from "../controllers/post/createPost"
import { updatePost } from "../controllers/post/updatePost"
import { createJoinRequest } from "../controllers/post/createJoinRequest"
import { acceptJoinRequest } from "../controllers/post/acceptJoinRequest"

const postRouter = express.Router()

postRouter.post("/create", createPost)
postRouter.put("/update/:id", updatePost)
postRouter.post("/join/:postId",createJoinRequest)
postRouter.post("/accept/:postId",acceptJoinRequest)

export { postRouter }
