import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Ride } from "./entity/Ride";
import { env } from "../config/server";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:5432?db=${env.POSTGRES_DB}`,
  synchronize: true,
  logging: false,
  entities: [User, Ride],
  migrations: [],
  subscribers: [],
});
