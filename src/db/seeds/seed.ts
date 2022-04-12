import db from "../connection";
import format from "pg-format";
import {
  User,
  BlogPost,
  BlogPostComment,
  Tag,
  Rating,
  Forum,
  ForumCategory,
  Reply,
  SubForum,
  Topic,
} from "./types";

interface seedProps {
  blogPosts: BlogPost[];
  blogPostComments: BlogPostComment[];
  tags: Tag[];
  users: User[];
  ratings: Rating[];
  forums: Forum[];
  forumCategories: ForumCategory[];
  replies: Reply[];
  subForums: SubForum[];
  topics: Topic[];
}

const seed = async ({
  blogPosts,
  blogPostComments,
  tags,
  users,
  ratings,
  forums,
  forumCategories,
  replies,
  subForums,
  topics,
}: seedProps) => {
  await db.query(`DROP TABLE IF EXISTS sub_topic_replies`);
  await db.query(`DROP TABLE IF EXISTS sub_forum_topics`);
  await db.query(`DROP TABLE IF EXISTS topic_replies`);
  await db.query(`DROP TABLE IF EXISTS forum_topics`);
  await db.query(`DROP TABLE IF EXISTS sub_forums`);
  await db.query(`DROP TABLE IF EXISTS forums`);
  await db.query(`DROP TABLE IF EXISTS forum_categories`);

  await db.query(`DROP TABLE IF EXISTS ratings`);
  await db.query(`DROP TABLE IF EXISTS tags`);
  await db.query(`DROP TABLE IF EXISTS blog_comments`);
  await db.query(`DROP TABLE IF EXISTS blog_posts`);
  await db.query(`DROP TABLE IF EXISTS users`);

  // await db.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  // await db.query(`
  //   CREATE TABLE tags (
  //     slug VARCHAR(30) UNIQUE PRIMARY KEY NOT NULL,
  //     description TEXT NOT NULL
  //   );
  // `);

  await db.query(`
      CREATE TABLE users (
        user_id BIGSERIAL PRIMARY KEY NOT NULL,
        username VARCHAR(30) UNIQUE NOT NULL,
        avatar VARCHAR(255) NOT NULL DEFAULT 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg',
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        location VARCHAR(100),
        role VARCHAR(50) DEFAULT 'member',
        password TEXT NOT NULL,
        password_changed_at TIMESTAMPTZ,
        password_reset_token VARCHAR(100),
        password_reset_expires TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        active BOOLEAN NOT NULL DEFAULT TRUE
      );
  `);

  await db.query(`
    CREATE TABLE blog_posts (
      post_id BIGSERIAL PRIMARY KEY NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      author VARCHAR(100) REFERENCES users(username) ON DELETE CASCADE NOT NULL,
      post_banner VARCHAR(255),
      tags VARCHAR[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

  `);

  await db.query(`
    CREATE TABLE blog_comments (
      comment_id BIGSERIAL PRIMARY KEY NOT NULL,
      author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE NOT NULL,
      post_id BIGINT REFERENCES blog_posts(post_id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      edited BOOLEAN NOT NULL DEFAULT FALSE,
      body TEXT NOT NULL
    );


  `);

  await db.query(`
    CREATE TABLE ratings (
      rating_id BIGSERIAL PRIMARY KEY NOT NULL,
      location_id BIGINT REFERENCES blog_posts(post_id) ON DELETE CASCADE NOT NULL,
      author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
      rating DECIMAL NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

  `);

  //-----------------------------------------------------------------------------------------------

  await db.query(`
      CREATE TABLE forum_categories (
        category_id BIGSERIAL PRIMARY KEY NOT NULL,
        admin_only BOOLEAN DEFAULT FALSE,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
  `);

  // topics INT DEFAULT 0,
  // replies INT DEFAULT 0,
  await db.query(`
      CREATE TABLE forums (
        forum_id BIGSERIAL PRIMARY KEY NOT NULL,
        name VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        parent_forum_id BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        category_id BIGINT REFERENCES forum_categories(category_id)
      )
  `);

  // topics INT DEFAULT 0,
  // replies INT DEFAULT 0,
  //   await db.query(`
  //     CREATE TABLE sub_forums (
  //       sub_forum_id BIGSERIAL PRIMARY KEY NOT NULL,
  //       name VARCHAR(50) NOT NULL,
  //       description VARCHAR(255),
  //       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  //       forum_id BIGINT REFERENCES forums(id)
  //     )
  // `);

  await db.query(`
  CREATE TABLE forum_topics (
    topic_id BIGSERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(50) NOT NULL,
    forum_id BIGINT REFERENCES forums(forum_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    votes INT DEFAULT 0,
    author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    locked BOOLEAN DEFAULT FALSE,
    body TEXT NOT NULL
  )
`);

  await db.query(`
    CREATE TABLE topic_replies (
      reply_id BIGSERIAL PRIMARY KEY NOT NULL,
      author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
      quote_body TEXT,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      topic_id BIGINT REFERENCES forum_topics(topic_id) ON DELETE CASCADE NOT NULL
    )
`);

  //   await db.query(`
  //     CREATE TABLE sub_forum_topics (
  //       sub_topic_id BIGSERIAL PRIMARY KEY NOT NULL,
  //       title VARCHAR(50) NOT NULL,
  //       sub_forum_id BIGINT REFERENCES sub_forums(id) ON DELETE CASCADE NOT NULL,
  //       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  //       votes INT DEFAULT 0,
  //       author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
  //       pinned BOOLEAN DEFAULT FALSE,
  //       body TEXT NOT NULL

  //     )
  // `);

  //   await db.query(`
  //     CREATE TABLE sub_topic_replies (
  //       sub_reply_id BIGSERIAL PRIMARY KEY NOT NULL,
  //       author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
  //       quote_body TEXT,
  //       body TEXT NOT NULL,
  //       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  //       sub_topic_id BIGINT REFERENCES sub_forum_topics(id) ON DELETE CASCADE NOT NULL
  //     )
  // `);

  // const insertTags = format(
  //   `
  //     INSERT INTO tags
  //     (slug, description)
  //     VALUES
  //     %L
  //     RETURNING slug, description;
  // `,
  //   tags.map(({ slug, description }) => [slug, description])
  // );

  const insertUsers = format(
    `
      INSERT INTO users
      (username, avatar, name, email, location, role, password, created_at)
      VALUES
      %L
      RETURNING username, avatar, name, email, location, role, password, created_at, user_id;
    `,
    users.map(
      ({
        username,
        avatar,
        name,
        email,
        location,
        role,
        password,
        created_at,
      }: User) => {
        return [
          username,
          avatar,
          name,
          email,
          location,
          role,
          password,
          created_at,
        ];
      }
    )
  );

  const insertBlogComments = format(
    `
      INSERT INTO blog_comments
      (author, post_id, created_at, body)
      VALUES
      %L
      RETURNING author, post_id, created_at, body;
  `,
    blogPostComments.map(
      ({ author, post_id, created_at, body }: BlogPostComment) => [
        author,
        post_id,
        created_at,
        body,
      ]
    )
  );

  const insertRatings = format(
    `
      INSERT INTO ratings
      (location_id, author, rating)
      VALUES
      %L
      RETURNING location_id, author, rating;
  `,
    ratings.map(({ location_id, author, rating }: Rating) => [
      location_id,
      author,
      rating,
    ])
  );

  //----------------------------FORUM----------------------------------------

  const insertForumCategories = format(
    `
    INSERT INTO forum_categories
    (name)
    VALUES
    %L;
    `,
    forumCategories.map(({ name }: ForumCategory) => [name])
  );

  const insertForums = format(
    `
    INSERT INTO forums
    (name, description, category_id)
    VALUES
    %L;
    `,
    forums.map(({ name, description, category_id }) => [
      name,
      description,
      category_id,
    ])
  );

  const insertSubForums = format(
    `
    INSERT INTO forums
    (name, description, parent_forum_id)
    VALUES
    %L;
    `,
    subForums.map(({ name, description, parent_forum_id }) => [
      name,
      description,
      parent_forum_id,
    ])
  );

  const insertForumsTopics = format(
    `
    INSERT INTO forum_topics
    (title, forum_id, author, pinned, body)
    VALUES
    %L;
    `,
    topics.map(({ title, forum_id, author, pinned, body }) => [
      title,
      forum_id,
      author,
      pinned,
      body,
    ])
  );

  const insertTopicReplies = format(
    `
    INSERT INTO topic_replies
    (author, quote_body, body, topic_id)
    VALUES
    %L;
    `,
    replies.map(({ author, quote_body, body, topic_id }) => [
      author,
      quote_body,
      body,
      topic_id,
    ])
  );

  // await db.query(insertTags);
  await db.query(insertUsers);

  for (const {
    author,
    post_banner,
    body,
    title,
    created_at,
    tags,
  } of blogPosts) {
    const insertBlogPost = format(
      `
      INSERT INTO blog_posts
      ( author, post_banner, body, title, created_at, tags)
      VALUES
      (%L, ARRAY[%L])
      RETURNING author, post_banner, body, title, created_at, tags
  `,
      [author, post_banner, body, title, created_at],
      tags
    );

    await db.query(insertBlogPost);
  }
  await db.query(insertBlogComments);
  await db.query(insertRatings);

  await db.query(insertForumCategories);
  await db.query(insertForums);
  await db.query(insertSubForums);
  await db.query(insertForumsTopics);
  await db.query(insertTopicReplies);
};

export default seed;
