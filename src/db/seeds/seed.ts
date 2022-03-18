import db from "../connection";
import format from "pg-format";

const seed = async () => {
  await db.query(`DROP TABLE IF EXISTS users`);
  await db.query(`DROP TABLE IF EXISTS blog_posts`);
  await db.query(`DROP TABLE IF EXISTS ratings`);
  await db.query(`DROP TABLE IF EXISTS tags`);
  await db.query(`DROP TABLE IF EXISTS blog_comments`);
  await db.query(`DROP TABLE IF EXISTS forum_categories`);
  await db.query(`DROP TABLE IF EXISTS forums`);
  await db.query(`DROP TABLE IF EXISTS forum_topics`);
  await db.query(`DROP TABLE IF EXISTS topic_replies`);
};

export default seed;
