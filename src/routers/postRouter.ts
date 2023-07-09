import * as express from "express"

import { createPost } from "../controllers/post/createPost"

const postRouter = express.Router()

postRouter.post("/create", createPost )

export { postRouter }
