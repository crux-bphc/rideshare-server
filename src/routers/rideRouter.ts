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
  createJoinRequest,
  createJoinRequestValidator,
} from "../controllers/ride/createJoinRequest";

import {
  acceptJoinRequest,
  acceptJoinRequestValidator,
} from "../controllers/ride/acceptJoinRequest";

import { 
    findRide, 
    findRideValidator 
} from "../controllers/ride/findRide";

import {
  searchRides,
  searchRideValidator,
} from "../controllers/ride/searchRides";

import { isLoggedIn } from "../middleware/auth";

const rideRouter = express.Router();

rideRouter.post("/create", createRideValidator,isLoggedIn ,createRide);
rideRouter.put("/update/:id", updateRideValidator,isLoggedIn ,updateRide);
rideRouter.get("/join/:rideId", createJoinRequestValidator,isLoggedIn ,createJoinRequest);
rideRouter.post("/accept/:rideId", acceptJoinRequestValidator,isLoggedIn,acceptJoinRequest);
rideRouter.get("/find/:rideId", findRideValidator,isLoggedIn ,findRide);
rideRouter.get("/search", searchRideValidator,isLoggedIn ,searchRides);

export { rideRouter };
