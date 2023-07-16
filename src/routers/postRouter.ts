import * as express from "express"

import { createPost } from "../controllers/post/createPost"
import { updatePost } from "../controllers/post/updatePost"

const postRouter = express.Router()

postRouter.post("/create", createPost)
postRouter.put("/update/:id", updatePost)

export { postRouter }
