import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";

export const findAllUsers = async (req: Request, res: Response) => {
  const users = await userRepository.find({});
  if (users.length === 0) {
   return res.json({ message: "no users found" });
  }
  return res.json(users);
};
