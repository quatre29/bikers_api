import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  addNewForumCategory,
  createNewForum,
  createNewSubForum,
  deleteCategory,
  deleteForum,
  editForum,
  editForumCategory,
  selectForumById,
  selectForumCategories,
  selectForumCategoryById,
  selectForumsByCategory,
  selectSubForumsByForumId,
} from "../models/forums.model";
import { checkIfRowExists } from "../utils/check";
import {
  validateForumUpdateBody,
  validateNewForum,
  validateNewForumCategoryBody,
  validateUpdateForumCategoryBody,
} from "../utils/validate";

export const getForumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;

    const forum = await selectForumById(forum_id);

    res.status(200).send({ status: "success", data: { forum } });
  } catch (error) {
    next(error);
  }
};

export const getAllForumCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.user;

    const categories = await selectForumCategories(role);

    res.status(200).send({ status: "success", data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const getForumCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.user;
    const { category_id } = req.params;

    const category = await selectForumCategoryById(role, category_id);

    res.status(200).send({ status: "success", data: { category } });
  } catch (error) {
    next(error);
  }
};

export const createNewForumCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, admin_only } = req.body;

    const validBody = validateNewForumCategoryBody(name, admin_only);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const isPrivate = admin_only ? admin_only : false;

    const categories = await addNewForumCategory(name, isPrivate);

    res.status(200).send({ status: "success", data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const updateForumCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category_id } = req.params;
    const { name, admin_only } = req.body;

    const validate = validateUpdateForumCategoryBody(name, admin_only);

    if (!validate.valid) {
      return next(new AppError(validate.msg!, 400));
    }

    const oldCategory = await checkIfRowExists(category_id, "forum_categories");

    if (!oldCategory) {
      return next(new AppError("Not found", 404));
    }

    const newCategory = {
      category_id,
      name: name ? name : oldCategory.name,
      admin_only: admin_only ? admin_only : oldCategory.admin_only,
    };

    const category = await editForumCategory(newCategory);

    res.status(200).send({ status: "success", data: { category } });
  } catch (error) {
    next(error);
  }
};

export const deleteForumCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category_id } = req.params;

    const category = await checkIfRowExists(category_id, "forum_categories");

    if (!category) {
      return next(new AppError("No forum category found", 404));
    }

    await deleteCategory(category_id);

    res.status(204).send({ status: "success", msg: "Forum Category Deleted" });
  } catch (error) {
    next(error);
  }
};

export const getForumsByCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category_id } = req.params;

    const category = await checkIfRowExists(category_id, "forum_categories");

    if (!category) {
      return next(new AppError("No forum category found", 404));
    }

    const forums = await selectForumsByCategory(category_id);

    res.status(200).send({ status: "success", data: { forums } });
  } catch (error) {
    next(error);
  }
};

export const getSubForumsByForumId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;

    const forums = await selectSubForumsByForumId(forum_id);

    res.status(200).send({ status: "success", data: { forums } });
  } catch (error) {
    next(error);
  }
};

export const addNewForum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const { category_id } = req.params;

    const category = await checkIfRowExists(category_id, "forum_categories");

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    const valid = validateNewForum(name, description);

    if (!valid.valid) {
      return next(new AppError(valid.msg!, 400));
    }

    const newForum = await createNewForum(name, description, category_id);

    if (!newForum) {
      return next(new AppError("Something went wrong", 400));
    }

    res.status(201).send({ status: "success", data: { forum: newForum } });
  } catch (error) {
    next(error);
  }
};

export const addNewSubForum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;

    const parentForumId = req.params.forum_id;

    const forum = await checkIfRowExists(parentForumId, "forums");

    if (forum.parent_forum_id) {
      return next(new AppError("Parent forum cannot be a sub-forum", 400));
    }

    const valid = validateNewForum(name, description, parentForumId);

    if (!valid.valid) {
      return next(new AppError(valid.msg!, 400));
    }

    const newSubForum = await createNewSubForum(
      name,
      description,
      parentForumId,
      forum.category_id
    );

    if (!newSubForum) {
      return next(new AppError("Something went wrong", 400));
    }

    res.status(201).send({ status: "success", data: { forum: newSubForum } });
  } catch (error) {
    next(error);
  }
};

export const removeForum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;

    const forum = await checkIfRowExists(forum_id, "forums");

    if (!forum) {
      return next(new AppError("Not found", 400));
    }

    await deleteForum(forum_id);

    res.status(204).send({ status: "success", msg: "Forum deleted" });
  } catch (error) {
    next(error);
  }
};

export const updateForum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;
    const { name, description, category_id, parent_forum_id } = req.body;

    const validate = validateForumUpdateBody(
      name,
      description,
      category_id,
      parent_forum_id
    );

    if (!validate.valid) {
      return next(new AppError(validate.msg!, 400));
    }

    const oldForum = await checkIfRowExists(forum_id, "forums");

    if (!oldForum) {
      return next(new AppError("Not found", 404));
    }

    const newForum: {
      forum_id: string;
      name: string;
      description: string;
      parent_forum_id: string;
      category_id: string;
    } = {
      ...oldForum,
      ...req.body,
    };

    if (
      oldForum.parent_forum_id === null &&
      newForum.parent_forum_id !== null
    ) {
      return next(
        new AppError("You cannot move parent forum to sub-forums", 400)
      );
    }

    if (oldForum.category_id === null && newForum.category_id !== null) {
      return next(
        new AppError("You cannot move sub-forum to be a parent-forum", 400)
      );
    }

    // check if parent forum or category forum exists
    if (parent_forum_id) {
      const parentForum = await checkIfRowExists(parent_forum_id, "forums");

      if (!parentForum || parentForum.category_id === null) {
        return next(
          new AppError("Parent forum not found or forum is not a parent", 400)
        );
      }
    }

    if (category_id) {
      const categoryRow = await checkIfRowExists(
        category_id,
        "forum_categories"
      );

      if (!categoryRow) {
        return next(new AppError("Category not found", 404));
      }
    }

    const forum = await editForum(
      forum_id,
      newForum.name,
      newForum.description,
      newForum.parent_forum_id,
      newForum.category_id
    );

    res.status(200).send({ status: "success", data: { forum } });
  } catch (error) {
    next(error);
  }
};
