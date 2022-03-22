import express, { NextFunction, Response, Request } from "express";
import { decode, sign, verity } from "../utils/jwt";
import rejectQuery from "../errors/rejectQuery";
import { jwtCustomPayload } from "../utils/types";
const hasToken = (req: Request) =>
  req.headers.authorization &&
  req.headers.authorization.split(" ")[0] === "Bearer";

const getToken = (req: Request) => req.headers.authorization?.split(" ")[1];

const isAuth = (req: Request) => {
  if (hasToken(req)) {
    try {
      const token = getToken(req);
      const decoded = decode(token!);

      return verity(token as string, decoded?.payload);
    } catch (error) {
      return false;
    }
  }
};

const isAdmin = async () => {};
const isModerator = async () => {};

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (hasToken(req)) {
      const token = getToken(req);
      const decoded = decode(token!);

      if (decoded && verity(token as string, decoded?.payload)) {
        //TODO: Add actual payload username
        req.user = decoded.payload;
        next();
      } else {
        await rejectQuery("You don't have access, please log in");
      }
    } else {
      await rejectQuery("You don't have access, please log in");
    }
  } catch (error) {
    next(error);
  }
};

export default {
  isAdmin,
  isModerator,
  isAuthenticated,
};
