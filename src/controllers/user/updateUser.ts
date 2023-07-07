import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(403).json({ message: "User doesn't exist" });
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.phNo = req.body.phNo;
    user.batch = req.body.batch;

    await userRepository.save(user);

    res.status(200).json("Updated user.");

  } catch (err) {
    res.send(500).json(err);
  }

};
