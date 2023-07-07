import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";

export const findUser = async (req: Request, res: Response) => {
  const user = await userRepository.find({
    where: {
      id: req.params.id,
    },
  });
  if (user.length === 0) {
   return res.status(403).json({ message: "no users found" });
  }
  return res.status(200).json(user);
};
