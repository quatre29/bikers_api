import db from "../db/connection";
import format from "pg-format";
import { validateRoleSchema } from "../utils/validate";

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
        SELECT forum_topics.*, sum( 
          case topic_votes.vote
            WHEN TRUE THEN 1
            WHEN FALSE THEN -1
            ELSE 0
            END
         ) as votes, count(topic_votes.*) as votes_count, users.avatar as author_avatar,
         users.user_id as author_id, users.role as author_role, users.name as author_name,
         fc.name as forum_name, fp.forum_id as forum_parent_id, fp.name as forum_parent_name,
         forum_categories.name as forum_category, fc.category_id as forum_category_id
        FROM forum_topics
        LEFT JOIN topic_votes ON topic_votes.topic_id = forum_topics.topic_id
        LEFT JOIN forums fc ON forum_topics.forum_id = fc.forum_id
        LEFT JOIN forums fp ON fc.parent_forum_id = fp.forum_id
        LEFT JOIN users ON forum_topics.author = users.username
        LEFT JOIN forum_categories ON forum_categories.category_id = fc.category_id
        WHERE forum_topics.topic_id = $1
        GROUP BY forum_topics.topic_id, users.avatar, users.user_id, fc.name,
        fp.forum_id, forum_categories.name, fc.category_id
        ORDER BY forum_topics.created_at;
    `,
    [topic_id]
  );

  return topic.rows[0];
};

// export const selectTopicById = async (topic_id: string) => {
//   const topic = await db.query(
//     `
//         SELECT forum_topics.*, sum(
//           case topic_votes.vote
//             WHEN TRUE THEN 1
//             WHEN FALSE THEN -1
//             ELSE 0
//             END
//          ) as votes, count(topic_votes.*) as votes_count, users.avatar as author_avatar,
//          users.user_id as author_id, users.role as author_role, users.name as author_name FROM forum_topics
//         LEFT JOIN topic_votes ON topic_votes.topic_id = forum_topics.topic_id
//         LEFT JOIN users ON forum_topics.author = users.username
//         WHERE forum_topics.topic_id = $1
//         GROUP BY forum_topics.topic_id, users.avatar, users.user_id
//         ORDER BY forum_topics.created_at;
//     `,
//     [topic_id]
//   );

//   return topic.rows[0];
// };

export const getAllTopics = async () => {
  const topics = await db.query(`
        SELECT * FROM forum_topics;
    `);

  return topics.rows;
};

export const selectTopicsByForum = async (forum_id: string) => {
  //FIXME:TODO: get replies count (counts votes with how many replies topic has)
  const topics = await db.query(
    `
    SELECT forum_topics.*, sum(
        case topic_votes.vote
          WHEN TRUE THEN 1
          WHEN FALSE THEN -1
          ELSE 0
          END
        ) as votes ,count(topic_votes.*) as votes_count FROM forum_topics
    LEFT JOIN topic_votes ON topic_votes.topic_id = forum_topics.topic_id
    WHERE forum_topics.forum_id = $1
    GROUP BY forum_topics.topic_id
    ORDER BY forum_topics.pinned IS TRUE DESC, forum_topics.created_at;
    `,
    [forum_id]
  );

  return topics.rows;
};

// SELECT forum_topics.*, count(topic_replies.*) as replies_count ,sum(
//   case topic_votes.vote
//     WHEN TRUE THEN 1
//     WHEN FALSE THEN -1
//     ELSE 0
//     END
//   ) as votes, count(topic_votes.*) as votes_count FROM forum_topics
// LEFT JOIN topic_votes ON topic_votes.topic_id = forum_topics.topic_id
// LEFT JOIN topic_replies ON topic_replies.topic_id = forum_topics.topic_id
// WHERE forum_topics.forum_id = $1
// GROUP BY forum_topics.topic_id
// ORDER BY forum_topics.created_at;

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

export const InsertNewVoteTopic = async (
  topic_id: string,
  user_id: string,
  vote: boolean
) => {
  let voteRow: any;

  const existentVote = await db.query(
    `
    SELECT * FROM topic_votes
    WHERE topic_id = $1 AND user_id = $2;  
  `,
    [topic_id, user_id]
  );

  if (!existentVote.rows[0]) {
    voteRow = await db.query(
      `
      INSERT INTO topic_votes
      (topic_id, user_id, vote)
      VALUES
      (
        $1, $2, $3
      )
      RETURNING *;
    `,
      [topic_id, user_id, vote]
    );
  } else {
    voteRow = await db.query(
      `
      UPDATE topic_votes
      SET vote = $1
      WHERE user_id = $2 AND topic_id = $3
      RETURNING *;
    `,
      [vote, user_id, topic_id]
    );
  }

  return voteRow.rows[0];
};

export const selectMyTopicVote = async (topic_id: string, user_id: string) => {
  const vote = await db.query(
    `
    SELECT * FROM topic_votes
    WHERE topic_id = $1 AND user_id = $2;
  `,
    [topic_id, user_id]
  );

  return vote.rows[0];
};
