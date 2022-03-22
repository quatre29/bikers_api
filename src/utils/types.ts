import { JwtPayload } from "jsonwebtoken";

export type jwtCustomPayload = JwtPayload & {
  id: number;
  name: string;
  username: string;
  email?: string;
  created_at: Date;
  avatar: string;
  role: string;
};
