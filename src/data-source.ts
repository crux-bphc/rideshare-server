import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Ride } from "./entity/Ride";
import { deviceToken } from "./entity/deviceToken";
import { env } from "../config/server";

export let AppDataSource: DataSource = null;

if (env.NODE_ENV === "development") {
  AppDataSource = new DataSource({
    type: "postgres",
    url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db-dev:${env.PGPORT}?db-dev=${env.POSTGRES_DB}`,
    synchronize: true,
    logging: false,
    entities: [User, Ride, deviceToken],
    migrations: [],
    subscribers: [],
  });
} else if (env.NODE_ENV === "production") {
  AppDataSource = new DataSource({
    type: "postgres",
    url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@db:${env.PGPORT}?db=${env.POSTGRES_DB}`,
    synchronize: true,
    logging: false,
    entities: [User, Ride, deviceToken],
    migrations: [],
    subscribers: [],
  });
}
else {
  console.error("Please enter a valid environment!")
}


