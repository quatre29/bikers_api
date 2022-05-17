import db from "../db/connection";

export const insertNewBookmark = async (post_id: string, user_id: string) => {
  const bookmark = await db.query(
    `
      INSERT INTO blog_bookmarks
      (post_id, user_id)
      VALUES
      ($1, $2)
      RETURNING *;
    `,
    [post_id, user_id]
  );

  return bookmark.rows[0];
};

export const selectBookmarksByUser = async (user_id: string) => {
  const bookmarks = await db.query(
    `
    SELECT blog_bookmarks.*,users.name as author_name, blog_posts.title, blog_posts.author, blog_posts.created_at, blog_posts.tags FROM blog_bookmarks
    LEFT JOIN blog_posts ON blog_posts.post_id = blog_bookmarks.post_id
    LEFT JOIN users ON users.user_id = blog_bookmarks.user_id
    WHERE blog_bookmarks.user_id = $1;
  `,
    [user_id]
  );

  return bookmarks.rows;
};

export const selectBookmarksByPost = async (post_id: string) => {
  const bookmarks = await db.query(
    `
      SELECT * FROM blog_bookmarks
      WHERE post_id = $1;
    `,
    [post_id]
  );

  return bookmarks.rows;
};

export const deleteBookmark = async (post_id: string, user_id: string) => {
  const bookmark = await db.query(
    `
        DELETE FROM blog_bookmarks
        WHERE post_id = $1 and user_id = $2;
    `,
    [post_id, user_id]
  );

  return bookmark.rows[0];
};
