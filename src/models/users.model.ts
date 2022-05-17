import {
  FilteringUsers,
  ReturnedUser,
  UpdateUser,
  User,
  UserRole,
} from "../data-types/dataTypes";
import db from "../db/connection";
import { checkIfRowExists } from "../utils/check";
import { encryptPassword } from "../utils/password";

export const insertNewUser = async (user: User) => {
  const hashPassword = await encryptPassword(user.password as string);
  const newUser = await db.query(
    `
    INSERT INTO users
    (
        username, name, password, email, location, description
    )
    VALUES
    (
        $1, $2, $3, $4, $5, $6
    )
    RETURNING username, name, avatar, email, location, created_at, role, user_id, description;
        `,
    [
      user.username,
      user.name,
      hashPassword,
      user.email,
      user.location,
      user.description,
    ]
  );

  return newUser.rows[0];
};

export const _selectUserByColumn = async (
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

export const returnAllUsers = async (
  page = "1",
  limit = "10",
  location: string,
  role: string,
  username: string,
  name: string
) => {
  const paramsObj: any = {
    page,
    limit,
    location,
    role,
    username,
    name,
  };

  const availableData = [
    ...Object.keys(paramsObj)
      .filter((key) => {
        if (paramsObj[key] !== undefined) return key;
      })
      .map((el, i) => {
        if (el !== "page" && el !== "limit") {
          return `AND ${el} ~* $${i + 1}`;
        }
      }),
  ].join(" ");

  const users = await db.query(
    `
    SELECT user_id, username, name, email, location, role, created_at, description, avatar FROM users
    WHERE active = true
    ${availableData}
    LIMIT $2 OFFSET(($1 - 1) * $2);
    `,
    [
      ...Object.values(paramsObj).filter((val) => {
        if (val !== undefined) return val;
      }),
    ]
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
    username = $5,
    description = $6
    WHERE user_id = $7
    RETURNING user_id, username, avatar, name, email, location, role, description, created_at;
  `,
    [
      user.name,
      user.email,
      user.location,
      user.avatar,
      user.username,
      user.description,
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

export const selectUserById = async (user_id: string) => {
  const user = await db.query(
    `
    SELECT user_id, username, avatar, name, email, location, role, description, created_at
    FROM users
    WHERE user_id = $1
    `,
    [user_id]
  );

  return user.rows[0];
};

export const updateUserRole = async (user_id: string, role: UserRole) => {
  const user = await db.query(
    `
    UPDATE users
    SET role = $1
    WHERE user_id = $2
    RETURNING user_id, username, name, role, avatar, email, location, description, created_at;
  `,
    [role, user_id]
  );

  return user.rows[0];
};

export const selectUsersByPartialName = async (queryStr: string) => {
  const user = await db.query(
    `
    SELECT user_id, username, avatar, name, email, location, role, description, created_at
    FROM users
    WHERE LOWER(username) LIKE $1
    OR LOWER(name) LIKE $1
    OR LOWER(role) LIKE $1
  `,
    [`%${queryStr}%`]
  );

  return user.rows;
};
