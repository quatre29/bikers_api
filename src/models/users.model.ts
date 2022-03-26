import { User } from "../data-types/dataTypes";
import db from "../db/connection";
import { encryptPassword } from "../utils/password";

export const changedPasswordAfter = (
  JWTTimestamp: number,
  passChangedAt: Date
): boolean => {
  if (passChangedAt) {
    const changedTimestamp = +(passChangedAt.getTime() / 1000).toFixed();

    return JWTTimestamp < changedTimestamp;
  }

  //password not changed
  return false;
};

export const insertNewPassword = async (user_id: number, password: string) => {
  const user = await db.query(
    `
    UPDATE users
    SET 
    password_changed_at = to_timestamp($1 / 1000.0),
    password = $2
    WHERE user_id = $3
    RETURNING *;
    `,
    [Date.now(), password, user_id]
  );

  return user.rows[0];
};

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
  column: "user_id" | "username"
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
