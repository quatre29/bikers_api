import { NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";

export const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const verityToken = (token: string, next: NextFunction) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as Secret);
  } catch (error) {
    next(error);
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token, { complete: true });
};
