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
  await db.query(`DROP TABLE IF EXISTS users`);
  await db.query(`DROP TABLE IF EXISTS blog_posts`);
  await db.query(`DROP TABLE IF EXISTS ratings`);
  await db.query(`DROP TABLE IF EXISTS tags`);
  await db.query(`DROP TABLE IF EXISTS blog_comments`);
  // await db.query(`DROP TABLE IF EXISTS forum_categories`);
  // await db.query(`DROP TABLE IF EXISTS forums`);
  // await db.query(`DROP TABLE IF EXISTS forum_topics`);
  // await db.query(`DROP TABLE IF EXISTS topic_replies`);

  await db.query(`
    CREATE TABLE tags (
      slug VARCHAR(30) PRIMARY KEY UNIQUE NOT NULL,
      description TEXT NOT NULL
    );
  `);

  await db.query(`
      CREATE TABLE users (
        username VARCHAR(30) UNIQUE PRIMARY KEY NOT NULL,
        avatar VARCHAR(255) NOT NULL DEFAULT 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg',
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        location VARCHAR(100),
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  `);

  await db.query(`
    CREATE TABLE blog_posts
        post_id: SERIAL PRIMARY KEY NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        author VARCHAR(100) REFERENCES users(username) NOT NULL,
        post_banner VARCHAR(255),
        tags VARCHAR(100)[],
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  await db.query(`
    CREATE TABLE blog_comments
        comment_id PRIMARY KEY NOT NULL,
        author VARCHAR(30) REFERENCES users(username) NOT NULL,
        post_id INT REFERENCES blog_posts(post_id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        body TEXT NOT NULL

  `);

  await db.query(`
    CREATE TABLE ratings
        location_id INT REFERENCES blog_posts(post_id),
        user VARCHAR(30) REFERENCES users(username) NOT NULL,
        rating INT NOT NULL
  `);

  const insertTags = format(
    `
      INSERT INTO tags
      (slug, description)
      %L
      VALUES
      RETURNING slug, description;
  `,
    tags.map(({ slug, description }: Tag) => [slug, description])
  );

  const insertUsers = format(
    `
      INSERT INTO users
      (username, avatar, name, email, location, role, created_at)
      %L
      RETURNING username, avatar, name, email, location, role, created_at;
    `,
    users.map(
      ({ username, avatar, name, email, location, role, created_at }: User) => [
        username,
        avatar,
        name,
        email,
        location,
        role,
        created_at,
      ]
    )
  );

  const insertBlogPosts = format(
    `
      INSERT INTO blog_posts 
      ( author, post_banner, body, title, created_at, tags)
      %L
      RETURNING author, post_banner, body, title, created_at, tags;
  `,
    blogPosts.map(
      ({ author, post_banner, body, title, created_at, tags }: BlogPost) => [
        author,
        post_banner,
        body,
        title,
        created_at,
        tags,
      ]
    )
  );

  const insertBlogComments = format(
    `
      INSERT INTO blog_comments
      (author, post_id, created_at, body)
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
      (location_id, user, rating)
      %L
      RETURNING location_id, user, rating;
  `,
    ratings.map(({ location_id, user, rating }: Rating) => [
      location_id,
      user,
      rating,
    ])
  );

  await db.query(insertTags);
  await db.query(insertUsers);
  await db.query(insertBlogPosts);
  await db.query(insertBlogComments);
  await db.query(insertRatings);
};

export default seed;

// tags.map(
//   ({
//     location_id,
//     user,
//     rating,
//   }: {
//     location_id: number;
//     user: string;
//     rating: string;
//   }) => [location_id, user, rating]
// )
