import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";

export const findUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(403).json({ message: "User doesn't exist" });
    }

    return res.status(200).json(user);

  } catch (err) {
    res.status(500).json(err);
  }

};
