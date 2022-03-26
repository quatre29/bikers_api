import { NextFunction } from "express";
import jwt, {
  SignOptions,
  Secret,
  VerifyOptions,
  JwtPayload,
} from "jsonwebtoken";
import { jwtCustomPayload } from "./types";

const options: SignOptions = {
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  expiresIn: "30d",
  algorithm: "HS256",
};

// export const sign = (payload: jwtCustomPayload, subject: any) => {
//   const signOptions = { ...options, subject };
//   return jwt.sign(payload, process.env.PRIVATE_KEY as string, signOptions);
// };

export const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// export const verityToken = (token: string, subject: string) => {
//   const verityOptions: VerifyOptions = {
//     ...options,
//     subject,
//     algorithms: ["RS256"],
//   };

//   try {
//     return jwt.verify(token, process.env.JWT_SECRET as Secret, verityOptions);
//   } catch (error) {
//     return false;
//   }
// };

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
