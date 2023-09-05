import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import "dotenv/config";
import { env } from "../../config/server";

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const secretKey = env.JWT_SECRET;

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, secretKey);
    req.token = decoded;

    next();
  } catch (err) {
    res.status(401).send('User not logged in');
  }
}