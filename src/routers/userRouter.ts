import * as express from "express"

import { createUser } from "../controllers/user/createUser"
import { updateUser } from "../controllers/user/updateUser"
import { findUser } from "../controllers/user/findUser"

const userRouter = express.Router()

userRouter.put("/create", createUser )
userRouter.post("/update/:id", updateUser )
userRouter.get("/search/:id" , findUser )

export { userRouter }
