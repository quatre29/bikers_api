import express, { NextFunction, Response, Request } from "express";
import { decodeToken, verityToken } from "../utils/jwt";
import { jwtCustomPayload } from "../utils/types";
import AppError from "../errors/AppError";
import {
  changedPasswordAfter,
  selectUserByColumn,
} from "../models/users.model";
// import { JwtPayload } from "jsonwebtoken";
// import { valid } from "joi";

const hasToken = (req: Request) =>
  req.headers.authorization &&
  req.headers.authorization.split(" ")[0] === "Bearer";

const getToken = (req: Request) => req.headers.authorization?.split(" ")[1];

const isAuth = (req: Request) => {
  if (hasToken(req)) {
    try {
      const token = getToken(req);

      // return verityToken(token as string, next);
    } catch (error) {
      return false;
    }
  }

  return false;
};

export const isAdmin = async () => {};
export const isModerator = async () => {};

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (hasToken(req)) {
      const token = getToken(req);
      const decoded = decodeToken(token!);

      const validToken = verityToken(token as string, next) as {
        id: number;
        iat: number;
        exp: number;
      };

      if (validToken) {
        const currentUser = await selectUserByColumn(
          validToken.id.toString(),
          "user_id"
        );

        if (!currentUser) {
          return next(
            new AppError(
              "The user belonging to this token does no longer exist",
              401
            )
          );
        }

        const isPasswordChanged: boolean = changedPasswordAfter(
          validToken.iat,
          currentUser.password_changed_at
        );

        if (isPasswordChanged) {
          return next(
            new AppError(
              "User recently changed password! Please log in again",
              401
            )
          );
        }

        req.user = currentUser;
        next();
      } else {
        return next(new AppError("You don't have access, please log in", 401));
      }
    } else {
      return next(new AppError("You don't have access, please log in", 401));
    }
  } catch (error) {
    next(error);
  }
};
