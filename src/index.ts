import express from "express"
import bodyParser from "body-parser"
import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "./data-source"

import { userRouter } from "./routers/userRouter"
import { rideRouter } from "./routers/rideRouter"
const pino = require('pino-http')()

import "dotenv/config";
import { env } from "../config/server";

AppDataSource.initialize().then(async () => {

  // create express app
  const app = express()

  app.use(bodyParser.json())
  app.use(pino)

  app.use("/user", userRouter)
  app.use("/ride", rideRouter)

  // start express server
  app.listen(env.PORT)

  // Error handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
  });

  console.log(`Express server has started on port ${env.PORT}. Open http://localhost:${env.PORT}/user to see results`)

}).catch(error => console.log(error))
