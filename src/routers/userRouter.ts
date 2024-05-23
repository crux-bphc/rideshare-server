import * as express from "express";

import {
  createUser,
  createUserValidator,
} from "../controllers/user/createUser";

import {
  createUserDev,
  createUserDevValidator,
} from "../controllers/user/createUserDev";

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

import {
  loginUserDev,
  loginUserDevValidator,
} from "../controllers/user/loginUserDev";

import {
  refreshUser,
  refreshUserValidator,
} from "../controllers/user/refreshUser";

import { isLoggedIn } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/refresh", refreshUserValidator, refreshUser);

if (process.env.NODE_ENV === "production") {
  userRouter.post("/create", createUserValidator, createUser);
  userRouter.post("/login", loginUserValidator, loginUser);
} else if (process.env.NODE_ENV === "development") {
  userRouter.post("/create", createUserDevValidator, createUserDev);
  userRouter.post("/login", loginUserDevValidator, loginUserDev);
}

userRouter.put("/update", updateUserValidator, isLoggedIn, updateUser);
userRouter.get("/find/:email", findUserValidator, isLoggedIn, findUser);


export { userRouter };
