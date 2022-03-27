import { User } from "../data-types/dataTypes";
import db from "../db/connection";
import { checkIfRowExists } from "../utils/check";
import { encryptPassword } from "../utils/password";

export const insertNewUser = async (user: User) => {
  const hashPassword = await encryptPassword(user.password as string);
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
    RETURNING username, name, avatar, email, location, created_at, role, user_id
        `,
    [user.username, user.name, hashPassword, user.email, user.location]
  );

  return newUser.rows[0];
};

export const selectUserByColumn = async (
  property: string,
  column: "user_id" | "username" | "email" | "password_reset_token"
) => {
  const user = await db.query(
    `
    SELECT * FROM users
    WHERE ${column} = $1;
    `,
    [property]
  );

  return user.rows[0];
};

export const returnAllUsers = async () => {
  const users = await db.query(
    `
    SELECT * FROM users;
    `
  );

  return users.rows;
};

export const removeUser = async (user_id: number) => {
  await db.query(
    `
    DELETE FROM users
    WHERE user_id = $1
    `,
    [user_id]
  );
};
