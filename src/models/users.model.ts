import { hash } from "bcrypt";
import { User } from "../data-types/dataTypes";
import db from "../db/connection";
import { encryptPassword } from "../utils/password";

export const insertNewUser = async (user: User) => {
  const hashPassword = await encryptPassword(user.password);
  const newUser = await db.query(
    `
    INSERT INTO users
    (
        username, name, password, email, location
    )
    VALUES
    (
        $1, $2, $3, $4, $5
    )
    RETURNING username, name, avatar, email, location, created_at, role
        `,
    [user.username, user.name, hashPassword, user.email, user.location]
  );

  console.log(newUser.rows, "=============");

  return newUser.rows[0];
};
