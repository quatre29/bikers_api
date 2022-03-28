import { NextFunction } from "express";
import db from "../db/connection";
import AppError from "../errors/AppError";

type tableProps = "users" | "blog_posts" | "blog_comments" | "ratings";

export const checkIfRowExists = async (
  id: number,
  table: tableProps,
  next: NextFunction
) => {
  let table_ref = "";
  let table_name = "";

  switch (table) {
    case "blog_posts":
      table_ref = "post_id";
      table_name = table;
      break;
    case "blog_comments":
      table_ref = "comment_id";
      table_name = table;
      break;
    case "users":
      table_ref = "user_id";
      table_name = table;
      break;
    case "ratings":
      table_ref = "rating_id";
      table_name = table;
      break;
  }
  const item = await db.query(
    `
        SELECT * FROM ${table_name} WHERE ${table_ref} = $1;
    `,
    [id]
  );

  if (item.rows.length === 0) {
    console.log(item.rows, "=====================");
    return next(new AppError(`${table} with id of ${id} does not exist`, 404));
  }
};