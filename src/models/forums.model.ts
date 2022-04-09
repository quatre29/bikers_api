import db from "../db/connection";

export const selectForumById = async (forum_id: string) => {
  const forum = await db.query(
    `
    SELECT * FROM forums
    WHERE forum_id = $1;
  `,
    [forum_id]
  );

  return forum.rows[0];
};

export const selectForumCategories = async (role: string) => {
  let categories;

  if (role === "moderator" || role === "admin") {
    categories = await db.query(
      `
            SELECT * FROM forum_categories;
            `
    );
  } else {
    categories = await db.query(
      `
            SELECT * FROM forum_categories
            WHERE admin_only = false;
            `
    );
  }

  return categories.rows;
};

export const addNewForumCategory = async (
  category_name: string,
  admin_only: boolean
) => {
  const newCategory = await db.query(
    `
        INSERT INTO forum_categories
        (name, admin_only)
        VALUES
        (
            $1, $2
        )
        RETURNING *;
        `,
    [category_name, admin_only]
  );

  return newCategory.rows[0];
};

export const editForumCategory = async (category: {
  category_id: string;
  admin_only: boolean;
  name: string;
}) => {
  const cat = await db.query(
    `
    UPDATE forum_categories
    SET admin_only = $1,
        name = $2
    WHERE category_id = $3
    RETURNING *;
  `,
    [category.admin_only, category.name, category.category_id]
  );

  return cat.rows[0];
};

export const deleteCategory = async (category_id: string) => {
  await db.query(
    `
    DELETE FROM forum_categories
    WHERE category_id = $1
  `,
    [category_id]
  );
};

export const selectForumsByCategory = async (category_id: string) => {
  const forums = await db.query(
    `
    SELECT * FROM forums
    WHERE category_id = $1;
  `,
    [category_id]
  );

  return forums.rows;
};

export const selectSubForumsByForumId = async (forum_id: string) => {
  const subForums = await db.query(
    `
    SELECT * FROM forums
    WHERE parent_forum_id = $1;
    `,
    [forum_id]
  );

  return subForums.rows;
};

export const createNewForum = async (
  name: string,
  description: string,
  category_id: string
) => {
  const newForum = await db.query(
    `
    INSERT INTO forums
    (name, description, category_id)
    VALUES
    (
      $1, $2, $3
    )
    RETURNING *;
  `,
    [name, description, category_id]
  );

  return newForum.rows[0];
};

export const createNewSubForum = async (
  name: string,
  description: string,
  parent_forum_id: string
) => {
  const newForum = await db.query(
    `
    INSERT INTO forums
    (name, description, parent_forum_id)
    VALUES
    (
      $1, $2, $3
    )
    RETURNING *;
  `,
    [name, description, parent_forum_id]
  );

  return newForum.rows[0];
};

export const deleteForum = async (forum_id: string) => {
  await db.query(
    `
    DELETE FROM forums
    WHERE forum_id = $1
    OR parent_forum_id = $1;
  `,
    [forum_id]
  );
};

export const editForum = async (
  forum_id: string,
  name: string,
  description: string,
  parent_forum_id: string,
  category_id: string
) => {
  const forum = await db.query(
    `
    UPDATE forums
    SET name = $1,
      description = $2,
      parent_forum_id = $3,
      category_id = $4
    WHERE forum_id = $5
    RETURNING *;
  `,
    [name, description, parent_forum_id, category_id, forum_id]
  );

  return forum.rows[0];
};
