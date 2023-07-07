import { Request, Response } from "express";
import { userRepository } from "../../repositories/userRepository";
import { User } from "../../entity/User";


export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new User();

    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.phNo = req.body.phNo;
    newUser.batch = req.body.batch;

    await userRepository.save(newUser);

    res.status(200).json("Created user.");

  } catch (err) {
    res.send(500).json(err);
  }

};
