import * as express from "express";

import {
  createUser,
  createUserValidator,
} from "../controllers/user/createUser";

import {
  updateUser,
  updateUserValidator,
} from "../controllers/user/updateUser";

import {
  findUser,
  findUserValidator
} from "../controllers/user/findUser";

import {
  loginUser,
  loginUserValidator
} from "../controllers/user/loginUser";

import { isLoggedIn } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/create", createUserValidator, createUser);
userRouter.put("/update", updateUserValidator, isLoggedIn, updateUser);
userRouter.get("/find/:email", findUserValidator, isLoggedIn, findUser);
userRouter.post("/login", loginUserValidator, loginUser);

export { userRouter };
