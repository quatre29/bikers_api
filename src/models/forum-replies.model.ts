import db from "../db/connection";
import format from "pg-format";

export const insertNewReply = async (
  topic_id: string,
  body: string,
  author: string
) => {
  const reply = await db.query(
    `
    INSERT INTO topic_replies
    (topic_id, body, author)
    VALUES
    ($1, $2, $3)
    RETURNING *;
  `,
    [topic_id, body, author]
  );

  return reply.rows[0];
};

export const updateReply = async (reply_id: string, body: string) => {
  const reply = await db.query(
    `
        UPDATE topic_replies
        SET
        body = $1
        WHERE 
        reply_id = $2
        RETURNING *;
    `,
    [body, reply_id]
  );

  return reply.rows[0];
};

export const deleteReply = async (reply_id: string) => {
  await db.query(
    `
        DELETE FROM topic_replies
        WHERE reply_id = $1;
    `,
    [reply_id]
  );
};

export const selectReplyById = async (reply_id: string) => {
  const reply = await db.query(
    `
    SELECT * FROM topic_replies
    WHERE reply_id = $1;
  `,
    [reply_id]
  );

  return reply.rows[0];
};

export const selectRepliesByTopic = async (topic_id: string) => {
  const reply = await db.query(
    `
      SELECT topic_replies.*, users.avatar as author_avatar, users.user_id as author_id,
      users.role as author_role, users.name as author_name FROM topic_replies
      LEFT JOIN users ON users.username = topic_replies.author
      WHERE topic_id = $1
      ORDER BY topic_replies.created_at DESC;
    `,
    [topic_id]
  );

  return reply.rows;
};
