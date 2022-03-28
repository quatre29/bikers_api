import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  returnAllUsers,
  removeUser,
  updateUser,
  deactivateUser,
} from "../models/users.model";

import { checkIfRowExists } from "../utils/check";

//--------------------------------------------------------------------------

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = req.query;
    const page = queryParams["page"] as string;
    const limit = queryParams["limit"] as string;
    const location = queryParams["location"] as string;
    const role = queryParams["role"] as string;
    const username = queryParams["username"] as string;
    const name = queryParams["name"] as string;

    const users = await returnAllUsers(
      page,
      limit,
      location,
      role,
      username,
      name
    );

    if (users.length < 1)
      return next(new AppError("No users could be found", 404));

    res.status(200).send({ status: "success", data: { users } });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.password) {
      return next(
        new AppError(
          "This route is not for password updates, please use updatePassword",
          400
        )
      );
    }

    const user = await updateUser(req.user, req.body);

    res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const deactivateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deactivateUser(req.user.user_id);

    res
      .status(204)
      .send({ status: "success", data: null, msg: "Account deactivated" });
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

    res
      .status(204)
      .send({ status: "success", data: null, msg: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {};
