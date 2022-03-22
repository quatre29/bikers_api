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

export const sign = (payload: jwtCustomPayload, subject: any) => {
  const signOptions = { ...options, subject };
  return jwt.sign(payload, process.env.PRIVATE_KEY as string, signOptions);
};

export const verity = (token: string, subject: any) => {
  const verityOptions: VerifyOptions = {
    ...options,
    subject,
    algorithms: ["RS256"],
  };

  try {
    return jwt.verify(token, process.env.PUBLIC_KEY as Secret, verityOptions);
  } catch (error) {
    return false;
  }
};

export const decode = (token: string) => {
  return jwt.decode(token, { complete: true });
};
