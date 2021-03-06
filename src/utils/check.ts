import db from "../db/connection";

type tableProps =
  | "users"
  | "blog_posts"
  | "blog_comments"
  | "ratings"
  | "forum_categories"
  | "forums"
  | "forum_topics"
  | "topic_replies";

export const checkIfRowExists = async (
  id: number | string,
  table: tableProps
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
    case "forum_categories":
      table_ref = "category_id";
      table_name = table;
      break;
    case "forum_topics":
      table_ref = "topic_id";
      table_name = table;
      break;
    case "topic_replies":
      table_ref = "reply_id";
      table_name = table;
      break;
    case "forums":
      table_ref = "forum_id";
      table_name = table;
      break;
  }
  const item = await db.query(
    `
        SELECT * FROM ${table_name} WHERE ${table_ref} = $1;
    `,
    [id]
  );

  return item.rows[0];
};
