import { Request, Response, NextFunction } from "express";
import { User } from "../data-types/dataTypes";
import AppError from "../errors/AppError";
import rejectQuery from "../errors/rejectQuery";

import { insertNewUser } from "../models/users.model";
import { encryptPassword } from "../utils/password";
import { validateUserSchema } from "../utils/validate";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, name, avatar, password, email, location, role }: User =
      req.body;

    if (role && role.length > 0) {
      return next(
        new AppError("You are not allowed to sign up with a custom rank", 403)
      );
    }

    const validateUser = validateUserSchema(req.body);

    console.log(validateUser, "validate user");

    let userInput = {
      username,
      name,
      password,
      email,
      location,
    };

    let newUser = {};

    if (validateUser.valid) {
      newUser = await insertNewUser(userInput);
    } else if (!validateUser.valid) {
      return next(new AppError(validateUser.msg!, 400));
    }

    res.status(201).send({ user: newUser });
  } catch (error) {
    next(error);
  }
};
// export const createUser = async (req: Request, res: Response, next: NextFunction) => {};
