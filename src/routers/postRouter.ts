import * as express from "express"

import { createPost } from "../controllers/post/createPost"
import { updatePost } from "../controllers/post/updatePost"
import { createJoinRequest } from "../controllers/post/createJoinRequest"

const postRouter = express.Router()

postRouter.post("/create", createPost)
postRouter.put("/update/:id", updatePost)
postRouter.post("/join/:id",createJoinRequest)

export { postRouter }
