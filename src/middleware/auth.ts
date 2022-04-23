import { NextFunction, Response, Request } from "express";
import { decodeToken, verityToken } from "../utils/jwt";
import AppError from "../errors/AppError";
import { _selectUserByColumn } from "../models/users.model";
import { changedPasswordAfter } from "../models/auth.model";

const hasToken = (req: Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return true;
  } else if (req.cookies.jwt) {
    return true;
  } else {
    return false;
  }
};

const getToken = (req: Request) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  return token;
};

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

      if (validToken) {
        const currentUser = await _selectUserByColumn(
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

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.cookies.jwt) {
      const token = getToken(req);

      const validToken = verityToken(token as string, next) as {
        id: number;
        username: string;
        iat: number;
        exp: number;
      };

      if (validToken) {
        const currentUser = await _selectUserByColumn(
          validToken.id.toString(),
          "user_id"
        );

        if (!currentUser) {
          return next();
        }

        const isPasswordChanged: boolean = changedPasswordAfter(
          validToken.iat,
          currentUser.password_changed_at
        );

        if (isPasswordChanged) {
          return next();
        }

        req.user = currentUser;
        return next();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
