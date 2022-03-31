import db from "../db/connection";
import format from "pg-format";

export const insertNewComment = async (
  post_id: string,
  body: string,
  author: string
) => {
  const comment = await db.query(
    `
    INSERT INTO blog_comments
    (body, post_id, author)
    VALUES
    (
      $1, $2, $3
    )
    RETURNING *;
  `,
    [body, post_id, author]
  );

  return comment.rows[0];
};

export const updateBlogComment = async (
  post_id: string,
  comment_id: string,
  body: string
) => {
  const comment = await db.query(
    `
    UPDATE blog_comments
    SET
    body = $1,
    edited = TRUE
    WHERE post_id = $2 AND comment_id = $3
    RETURNING *;
  `,
    [body, post_id, comment_id]
  );

  return comment.rows[0];
};

export const removeBlogComment = async (
  post_id: string,
  comment_id: string
) => {
  await db.query(
    `
    DELETE FROM blog_comments
    WHERE post_id = $1 AND comment_id = $2
  `,
    [post_id, comment_id]
  );
};

export const selectBlogPostComments = async (post_id: string) => {
  const comments = await db.query(
    `
        SELECT * FROM blog_comments
        WHERE post_id = $1
    `,
    [post_id]
  );

  return comments.rows;
};

export const selectBlogCommentOnPost = async (
  post_id: string,
  comment_id: string
) => {
  const post = await db.query(
    `
    SELECT * FROM blog_comments
    WHERE post_id = $1 AND comment_id = $2;
  `,
    [post_id, comment_id]
  );

  return post.rows[0];
};
