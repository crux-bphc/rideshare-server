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

// userRouter.post("/create", createUserValidator, createUser);
userRouter.post("/create", createUserDevValidator, createUserDev);

userRouter.put("/update", updateUserValidator, isLoggedIn, updateUser);
userRouter.get("/find/:email", findUserValidator, isLoggedIn, findUser);

// userRouter.post("/login", loginUserValidator, loginUser);
userRouter.post("/login", loginUserDevValidator, loginUserDev);

export { userRouter };
