import * as express from "express";

import {
  createRide,
  createRideValidator,
} from "../controllers/ride/createRide";

import {
  updateRide,
  updateRideValidator,
} from "../controllers/ride/updateRide";

import {
  createRequest,
  createRequestValidator,
} from "../controllers/ride/createRequest";

import {
  acceptRequest,
  acceptRequestValidator,
} from "../controllers/ride/acceptRequest";

import { findRide, findRideValidator } from "../controllers/ride/findRide";

import {
  searchRides,
  searchRideValidator,
} from "../controllers/ride/searchRides";

import {
  deleteRide,
  deleteRideValidator,
} from "../controllers/ride/deleteRide";

import {
  removeRequest,
  removeRequestValidator,
} from "../controllers/ride/removeRequest";

import {
  kickUserRequest,
  kickUserValidator,
} from "../controllers/ride/kickUser";

import { isLoggedIn } from "../middleware/auth";

const rideRouter = express.Router();

rideRouter.post("/create", createRideValidator, isLoggedIn, createRide);
rideRouter.put("/update/:id", updateRideValidator, isLoggedIn, updateRide);
rideRouter.get("/join/:id", createRequestValidator, isLoggedIn, createRequest);
rideRouter.post(
  "/accept/:id",
  acceptRequestValidator,
  isLoggedIn,
  acceptRequest
);
rideRouter.get("/find/:id", findRideValidator, isLoggedIn, findRide);
rideRouter.get("/search", searchRideValidator, isLoggedIn, searchRides);
rideRouter.delete("/delete/:id", deleteRideValidator, isLoggedIn, deleteRide);
rideRouter.delete(
  "/remove/:id",
  removeRequestValidator,
  isLoggedIn,
  removeRequest
);
rideRouter.delete("/kick/:id/", kickUserValidator, isLoggedIn, kickUserRequest);

export { rideRouter };
