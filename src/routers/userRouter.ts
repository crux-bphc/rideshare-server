import * as express from "express"

import { createUser,createUserValidator } from "../controllers/user/createUser"
import { updateUser,updateUserValidator } from "../controllers/user/updateUser"
import { findUser } from "../controllers/user/findUser"

const userRouter = express.Router()

userRouter.post("/create", createUserValidator ,createUser )
userRouter.put("/update/:id", updateUserValidator ,updateUser )
userRouter.get("/search/:id" , findUser )

export { userRouter }
