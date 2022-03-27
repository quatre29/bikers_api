import express, { NextFunction, Response, Request } from "express";
import { decodeToken, verityToken } from "../utils/jwt";
import { jwtCustomPayload } from "../utils/types";
import AppError from "../errors/AppError";
import { selectUserByColumn } from "../models/users.model";
import { changedPasswordAfter } from "../models/auth.model";
// import { JwtPayload } from "jsonwebtoken";
// import { valid } from "joi";

const hasToken = (req: Request) =>
  req.headers.authorization &&
  req.headers.authorization.split(" ")[0] === "Bearer";

const getToken = (req: Request) => req.headers.authorization?.split(" ")[1];

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
        username: string;
        iat: number;
        exp: number;
      };

      console.log(validToken);

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

type rolesProps = "admin" | "moderator";

export const restrictTo = (...roles: rolesProps[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
