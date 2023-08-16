import { AppDataSource } from "../data-source";
import { Ride } from "../entity/Ride";

export const rideRepository = AppDataSource.getRepository(Ride);
