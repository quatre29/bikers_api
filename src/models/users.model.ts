import { ReturnedUser, UpdateUser, User } from "../data-types/dataTypes";
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
    RETURNING username, name, avatar, email, location, created_at, role, user_id;
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
    SELECT user_id, username, name, email, location, role, created_at, avatar FROM users
    WHERE active = TRUE;
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

export const updateUser = async (
  updatedUser: UpdateUser,
  oldUser: ReturnedUser
) => {
  const user = {
    ...updatedUser,
    ...oldUser,
  };

  const updated = await db.query(
    `
    UPDATE users
    SET
    name = $1,
    email = $2,
    location = $3,
    avatar = $4,
    username = $5
    WHERE user_id = $6
    RETURNING user_id, username, avatar, name, email, location, role, created_at;
  `,
    [
      user.name,
      user.email,
      user.location,
      user.avatar,
      user.username,
      user.user_id,
    ]
  );

  return updated.rows[0];
};

export const deactivateUser = async (user_id: number) => {
  await db.query(
    `
    UPDATE users
    SET
    active = FALSE
    WHERE user_id = $1
    RETURNING *
  `,
    [user_id]
  );
};
