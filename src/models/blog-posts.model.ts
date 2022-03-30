import { BlogPost, UpdateBlogPost } from "../data-types/dataTypes";
import db from "../db/connection";
import format from "pg-format";

export const insertNewBlogPost = async (blogPost: BlogPost) => {
  const insertInto = format(
    `
    INSERT INTO blog_posts
    (title, author, body, post_banner, tags)
    VALUES
    (
      %L, ARRAY[%L]
    )
    RETURNING post_id, title, author, body, tags, post_banner, created_at;
  `,
    [blogPost.title, blogPost.author, blogPost.body, blogPost.post_banner],
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
    post_banner = $4
    WHERE
    post_id = $5
    RETURNING *;
  `,
    [newPost.title, newPost.body, newPost.tags, newPost.post_banner, post_id]
  );

  return post.rows[0];
};

export const selectAllBlogPosts = async (
  page = "1",
  limit = "10",
  title: string,
  author: string,
  tag: string
) => {
  const paramsObj: any = {
    page,
    limit,
    title,
    author,
    tag,
  };

  // console.log(paramsObj);

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

        if (el !== "page" && el !== "limit") {
          return `${i === 2 ? "WHERE" : "AND"} ${el} ~* $${i + 1}`;
        }
      }),
  ].join(" ");

  // console.log(availableData, "===");
  // console.log(
  //   ...Object.values(paramsObj)
  //     .filter((val) => {
  //       if (val !== undefined) return val;
  //     })
  //     .flat()
  // );

  const posts = await db.query(
    `
        SELECT * FROM blog_posts
        ${availableData}
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

export const selectBlogPostById = async (post_id: string) => {
  const post = await db.query(
    `
    SELECT * FROM blog_posts
    WHERE post_id = $1;
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
  author: string,
  rating: number
) => {
  const ratingRow = await db.query(
    `
    INSERT INTO ratings
    (location_id, author, rating)
    VALUES
    (
      $1, $2, $3
    )
    RETURNING *;
  `,
    [post_id, author, rating]
  );

  return ratingRow.rows[0];
};

export const selectRatingsByBlogPost = async (post_id: string) => {
  console.log(post_id);
  const ratings = await db.query(
    `
    SELECT * FROM ratings
    WHERE location_id = $1;
  `,
    [post_id]
  );

  return ratings.rows;
};
