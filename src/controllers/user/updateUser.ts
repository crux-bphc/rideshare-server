import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepository
    .createQueryBuilder("user")
    .update()
    .set({
      name: req.body.name,
      email: req.body.email,
      phNo: req.body.phNo,
      batch: req.body.batch,
    })
    .where("user.id = :id", { id: req.params.id })
    .execute()

    res.status(200).json("Updated user.");

  } catch (err) {
    res.send(500).json(err);
  }

};
