import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import { returnAllUsers, removeUser } from "../models/users.model";

import { checkIfRowExists } from "../utils/check";

//--------------------------------------------------------------------------

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await returnAllUsers();

    if (users.length < 1)
      return next(new AppError("No users could be found", 404));

    res.status(200).send({ status: "success", users });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;

    await checkIfRowExists(+user_id, "users", next);

    await removeUser(+user_id);

    res.status(204).send({ status: "success", msg: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {};
