import db from "../connection";
import format from "pg-format";
import { User, BlogPost, BlogPostComment, Tag, Rating } from "./types";

interface seedProps {
  blogPosts: BlogPost[];
  blogPostComments: BlogPostComment[];
  tags: Tag[];
  users: User[];
  ratings: Rating[];
}

const seed = async ({
  blogPosts,
  blogPostComments,
  tags,
  users,
  ratings,
}: seedProps) => {
  await db.query(`DROP TABLE IF EXISTS ratings`);
  await db.query(`DROP TABLE IF EXISTS tags`);
  await db.query(`DROP TABLE IF EXISTS blog_comments`);
  await db.query(`DROP TABLE IF EXISTS blog_posts`);
  await db.query(`DROP TABLE IF EXISTS users`);
  // await db.query(`DROP TABLE IF EXISTS forum_categories`);
  // await db.query(`DROP TABLE IF EXISTS forums`);
  // await db.query(`DROP TABLE IF EXISTS forum_topics`);
  // await db.query(`DROP TABLE IF EXISTS topic_replies`);

  await db.query(`
    CREATE TABLE tags (
      slug VARCHAR(30) UNIQUE PRIMARY KEY NOT NULL,
      description TEXT NOT NULL
    );
  `);

  await db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY NOT NULL,
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
      post_id SERIAL PRIMARY KEY NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      author VARCHAR(100) REFERENCES users(username) NOT NULL,
      post_banner VARCHAR(255),
      tags VARCHAR[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

  `);

  await db.query(`
    CREATE TABLE blog_comments (
      comment_id SERIAL PRIMARY KEY NOT NULL,
      author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE NOT NULL,
      post_id INT REFERENCES blog_posts(post_id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      body TEXT NOT NULL
    );


  `);

  await db.query(`
    CREATE TABLE ratings (
      rating_id SERIAL PRIMARY KEY NOT NULL,
      location_id INT REFERENCES blog_posts(post_id),
      author VARCHAR(30) REFERENCES users(username) ON DELETE CASCADE  NOT NULL,
      rating DECIMAL NOT NULL
    );

  `);

  const insertTags = format(
    `
      INSERT INTO tags
      (slug, description)
      VALUES
      %L
      RETURNING slug, description;
  `,
    tags.map(({ slug, description }) => [slug, description])
  );

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

  await db.query(insertTags);
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
};

export default seed;
