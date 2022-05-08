import { BlogPost, UpdateBlogPost } from "../data-types/dataTypes";
import db from "../db/connection";
import format from "pg-format";

export const insertNewBlogPost = async (blogPost: BlogPost) => {
  const insertInto = format(
    `
    INSERT INTO blog_posts
    (title, author, body, post_banner, description, author_id, tags)
    VALUES
    (
      %L, ARRAY[%L]
    )
    RETURNING post_id, title, author, body, tags, post_banner, description, author_id, created_at;
  `,
    [
      blogPost.title,
      blogPost.author,
      blogPost.body,
      blogPost.post_banner,
      blogPost.description,
      blogPost.author_id,
    ],
    blogPost.tags
  );
  const post = await db.query(insertInto);

  return post.rows[0];
};

export const updateBlogPost = async (
  updates: UpdateBlogPost,
  post_id: string
) => {
  const oldPost = await selectBlogPostById(post_id);

  const newPost = {
    ...oldPost,
    ...updates,
  };

  const post = await db.query(
    `
    UPDATE blog_posts
    SET
    title = $1,
    body = $2,
    tags = $3,
    post_banner = $4,
    description = $5
    WHERE
    post_id = $6
    RETURNING *;
  `,
    [
      newPost.title,
      newPost.body,
      newPost.tags,
      newPost.post_banner,
      newPost.description,
      post_id,
    ]
  );

  return post.rows[0];
};

export const selectAllBlogPosts = async (
  page = "1",
  limit = "10",
  title: string,
  author: string,
  tag: string,
  pinned: string
) => {
  const paramsObj: any = {
    page,
    limit,
    title,
    author,
    tag,
    pinned,
  };

  const availableData = [
    ...Object.keys(paramsObj)
      .filter((key) => {
        if (paramsObj[key] !== undefined) return key;
      })
      .map((el, i) => {
        if (el === "tag") {
          //if we have multiple tags => [tag1 , tag2]
          if (Array.isArray(paramsObj[el])) {
            // we spread the tags into multiple queries
            const tagsQuery = paramsObj[el]
              .map((tag: string, i2: number) => {
                //FIXME: Bad query, parameters cannot be combined with multiple tags
                const query = `${
                  i === 2 ? "WHERE" : i2 === 0 ? "AND" : "OR"
                } $${
                  //match the next idex for db query
                  i + 1
                } = any (tags)`;

                i++;
                return query;
              })
              .join(" ");

            return tagsQuery;
          } else {
            //if we don't have an array, we create only 1 query
            return `${i === 2 ? "WHERE" : "AND"} $${i + 1} = any (tags)`;
          }
        }

        if (el === "pinned") {
          return `${i === 2 ? "WHERE" : "AND"} ${el} = $${i + 1}`;
        }

        if (el !== "page" && el !== "limit") {
          return `${i === 2 ? "WHERE" : "AND"} ${el} ~* $${i + 1}`;
        }
      }),
  ].join(" ");
  // LEFT JOIN blog_bookmarks ON blog_bookmarks.user_id = blog_posts.

  const posts = await db.query(
    `
        SELECT blog_posts.*, count(ratings.*) as ratings_count, avg(ratings.rating) as avg_rating, count(blog_comments.*) as comments_count, users.avatar as author_avatar 
        FROM blog_posts
        LEFT JOIN ratings ON ratings.post_id = blog_posts.post_id
        LEFT JOIN blog_comments ON blog_comments.post_id = blog_posts.post_id
        LEFT JOIN users ON users.username = blog_posts.author
        ${availableData}
        GROUP BY blog_posts.post_id, users.avatar
        LIMIT $2 OFFSET(($1 - 1) * $2);
    `,
    [
      ...Object.values(paramsObj)
        .filter((val) => {
          if (val === undefined) return;

          return val;
        })
        .flat(),
    ]
  );
  return posts.rows;
};

// export const selectBlogPostById = async (post_id: string) => {
//   const post = await db.query(
//     `
//     SELECT blog_posts.*, count(ratings.*) as ratings_count, avg(ratings.rating) as avg_rating, users.avatar as author_avatar,
//     users.name as author_name, users.role as author_role, users.location as author_location, users.description as author_description
//     FROM blog_posts
//     LEFT JOIN ratings ON ratings.post_id = blog_posts.post_id
//     LEFT JOIN users ON users.username = blog_posts.author
//     WHERE blog_posts.post_id = $1
//     GROUP BY blog_posts.post_id, users.avatar, users.name, users.role, users.location, users.description;
//   `,
//     [post_id]
//   );

//   return post.rows[0];
// };

export const selectBlogPostById = async (post_id: string) => {
  const post = await db.query(
    `
    SELECT blog_posts.*, count(ratings.*) as ratings_count, avg(ratings.rating) as avg_rating, users.avatar as author_avatar,
    users.name as author_name, users.role as author_role, users.location as author_location, users.description as author_description
    FROM blog_posts
    LEFT JOIN ratings ON ratings.post_id = blog_posts.post_id
    LEFT JOIN users ON users.username = blog_posts.author
    LEFT JOIN blog_bookmarks ON blog_bookmarks.user_id = blog_posts.author_id AND blog_bookmarks.post_id = blog_posts.post_id
    WHERE blog_posts.post_id = $1
    GROUP BY blog_posts.post_id, users.avatar, users.name, users.role, users.location, users.description;
  `,
    [post_id]
  );

  return post.rows[0];
};

export const removeBlogPostById = async (post_id: string) => {
  await db.query(
    `
    DELETE FROM blog_posts
    WHERE post_id = $1;
  `,
    [post_id]
  );
};

export const insertBlogPostRating = async (
  post_id: string,
  user_id: string,
  rating: string
) => {
  let ratingRow;

  const checkIfRatingExists = await db.query(
    `
    SELECT * FROM ratings
    WHERE post_id = $1 AND user_id = $2;  
  `,
    [post_id, user_id]
  );
  if (!checkIfRatingExists.rows[0]) {
    ratingRow = await db.query(
      `
      WITH inserted_rating AS (
        INSERT INTO ratings
        (post_id, user_id, rating)
        VALUES
        (
          $1, $2, $3
        )
        RETURNING *
      )    SELECT inserted_rating.*, blog_posts.title, blog_posts.author, blog_posts.tags FROM inserted_rating
            LEFT JOIN blog_posts ON blog_posts.post_id = inserted_rating.post_id
            ORDER BY inserted_rating.created_at;
    `,
      [post_id, user_id, rating]
    );
  } else {
    ratingRow = await db.query(
      `
      WITH inserted_rating AS (
        UPDATE ratings
        SET rating = $1
        WHERE post_id = $2 AND user_id = $3
        RETURNING *
      )    SELECT inserted_rating.*, blog_posts.title, blog_posts.author, blog_posts.tags FROM inserted_rating
            LEFT JOIN blog_posts ON blog_posts.post_id = inserted_rating.post_id
            ORDER BY inserted_rating.created_at;
    `,
      [rating, post_id, user_id]
    );
  }
  return ratingRow.rows[0];
};

export const selectRatingsByBlogPost = async (post_id: string) => {
  const ratings = await db.query(
    `
    SELECT ratings.*, blog_posts.title, blog_posts.author, blog_posts.tags 
    FROM ratings
    LEFT JOIN blog_posts ON blog_posts.post_id = ratings.post_id
    WHERE ratings.post_id = $1
    ORDER BY ratings.created_at;
  `,
    [post_id]
  );

  return ratings.rows;
};

export const selectRatingsByUser = async (user_id: string) => {
  const ratings = await db.query(
    `
    SELECT ratings.*, blog_posts.title, blog_posts.author, blog_posts.tags 
    FROM ratings
    LEFT JOIN blog_posts ON blog_posts.post_id = ratings.post_id
    WHERE ratings.user_id = $1
    ORDER BY ratings.created_at;
  `,
    [user_id]
  );

  return ratings.rows;
};

export const selectMyBlogPostRating = async (
  post_id: string,
  user_id: string
) => {
  const rating = await db.query(
    `
    SELECT * FROM ratings
    WHERE user_id = $1 AND post_id = $2;
  `,
    [user_id, post_id]
  );

  return rating.rows[0];
};

export const updatePinnedBlogPost = async (
  pinned: boolean,
  post_id: string
) => {
  const updates = await db.query(
    `
    UPDATE blog_posts
    SET
    pinned = $1
    WHERE
    post_id = $2
    RETURNING *;
  `,
    [pinned, post_id]
  );

  return updates.rows[0];
};
