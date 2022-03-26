import { Request, Response, NextFunction } from "express";
import { ReturnedUser, User } from "../data-types/dataTypes";
import AppError from "../errors/AppError";
import jwt, { Secret } from "jsonwebtoken";
import {
  selectUserByColumn,
  insertNewUser,
  returnAllUsers,
  insertNewPassword,
} from "../models/users.model";
import { validateUserSchema } from "../utils/validate";
import { validatePassword, encryptPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { valid } from "joi";

export const signup = async (
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

    let userInput: User = {
      username,
      name,
      password,
      email,
      location,
    };

    let newUser: ReturnedUser = {} as ReturnedUser;

    if (validateUser.valid) {
      newUser = await insertNewUser(userInput);
    } else if (!validateUser.valid) {
      return next(new AppError(validateUser.msg!, 400));
    }

    const token = signToken(newUser.user_id);

    res.status(201).send({ status: "success", user: newUser, token });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { new_password } = req.body;
  const encryptedPassword = await encryptPassword(new_password);

  const updatedUser = await insertNewPassword(5, encryptedPassword);

  res.status(200).send({ status: "success", updatedUser });
};

//--------------------------------------------------------------------------

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError("Please provide username and password", 400));
    }

    const user = await selectUserByColumn(username, "username");
    const validPassword = await validatePassword(password, user.password);

    console.log(user, validPassword);

    if (!user || !validPassword) {
      return next(
        new AppError(
          "The username or password you entered did not match our records.Please double-check and try again",
          401
        )
      );
    }

    const token = signToken(user.user_id);

    res.status(200).send({ status: "success", token });
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

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

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {};
