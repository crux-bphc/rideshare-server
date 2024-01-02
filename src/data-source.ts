import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Ride } from "./entity/Ride";
import { deviceToken } from "./entity/deviceToken";
import { env } from "../config/server";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:${env.PGPORT}?db=${env.POSTGRES_DB}`,
  synchronize: true,
  logging: false,
  entities: [User, Ride, deviceToken],
  migrations: [],
  subscribers: [],
});
