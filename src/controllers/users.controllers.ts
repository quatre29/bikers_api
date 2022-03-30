import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  returnAllUsers,
  removeUser,
  updateUser,
  deactivateUser,
  _selectUserByColumn,
  selectUserById,
  updateUserRole,
} from "../models/users.model";

import { checkIfRowExists } from "../utils/check";
import { validateRoleSchema } from "../utils/validate";

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

    const user = await checkIfRowExists(user_id, "users");

    if (!user) {
      return next(
        new AppError(`User with id - ${user_id} does not exist`, 404)
      );
    }

    await removeUser(+user_id);

    res
      .status(204)
      .send({ status: "success", data: null, msg: "User deleted" });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;

    const user = await selectUserById(user_id);

    if (!user) {
      return next(new AppError("User does not exist", 404));
    }

    res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const _changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;
    const { role } = req.body;

    const validRole = validateRoleSchema(role.toLowerCase());

    if (!validRole.valid) {
      return next(new AppError(validRole.msg!, 400));
    }

    const user = await updateUserRole(user_id, role.toLowerCase());

    res.status(200).send({
      status: "success",
      data: { user },
      msg: "User's role has been changed",
    });
  } catch (error) {
    next(error);
  }
};

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {};
