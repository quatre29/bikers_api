import db from "../db/connection";
import format from "pg-format";

export const insertNewTopic = async (
  forum_id: string,
  title: string,
  pinned: boolean,
  body: string,
  author: string
) => {
  const topic = await db.query(
    `
        INSERT INTO forum_topics
        (forum_id, title, pinned, body, author)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *;
    `,
    [forum_id, title, pinned, body, author]
  );

  return topic.rows[0];
};

export const selectTopicById = async (topic_id: string) => {
  const topic = await db.query(
    `
        SELECT * FROM forum_topics
        WHERE topic_id = $1;
    `,
    [topic_id]
  );

  return topic.rows[0];
};

export const getAllTopics = async () => {
  const topics = await db.query(`
        SELECT * FROM forum_topics;
    `);

  return topics.rows;
};

export const selectTopicsByForum = async (forum_id: string) => {
  const topics = await db.query(
    `
        SELECT * FROM forum_topics
        WHERE forum_id = $1;
    `,
    [forum_id]
  );

  return topics.rows;
};

export const deleteTopic = async (topic_id: string) => {
  await db.query(
    `
        DELETE FROM forum_topics
        WHERE topic_id = $1;
    `,
    [topic_id]
  );
};

export const updateTopic = async (
  topic_id: string,
  title: string,
  pinned: boolean,
  body: string
) => {
  const topic = await db.query(
    `
    UPDATE forum_topics
    SET
    title = $1,
    pinned = $2,
    body = $3
    WHERE topic_id = $4
    RETURNING *;
  `,
    [title, pinned, body, topic_id]
  );

  return topic.rows[0];
};

export const updateLockTopic = async (topic_id: string, locked: boolean) => {
  const topic = await db.query(
    `
      UPDATE forum_topics
      SET
      locked = $1
      WHERE topic_id = $2
      RETURNING *;
    `,
    [locked, topic_id]
  );

  console.log(topic.rows);

  return topic.rows[0];
};

export const updateVoteTopic = async (topic_id: string) => {};
