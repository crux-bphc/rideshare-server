import * as express from "express"

import { findAllUsers } from "../controllers/user/findAllUsers"

const userRouter = express.Router()

userRouter.get("/" , findAllUsers )

export { userRouter }