import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";


export const createUser = async (req: Request, res: Response) => {
  try {

    await userRepository
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([{
      name: req.body.name,
      email: req.body.email,
      phNo: req.body.phNo,
      batch: req.body.batch,
    }])
    .execute()

    res.status(200).json("Created user.");

  } catch (err) {
    res.send(500).json(err);
  }

};
