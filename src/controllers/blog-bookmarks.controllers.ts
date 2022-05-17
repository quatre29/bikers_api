import { Request, Response, NextFunction } from "express";
import {
  deleteBookmark,
  insertNewBookmark,
  selectBookmarksByPost,
  selectBookmarksByUser,
} from "../models/blog-bookmarks.model";

export const bookmarkBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    const bookmark = await insertNewBookmark(post_id, user_id);

    res.status(201).send({ status: "success", data: { post: bookmark } });
  } catch (error) {
    next(error);
  }
};

export const unBookmarkBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    await deleteBookmark(post_id, user_id);

    res.status(204).send({ status: "success", data: {} });
  } catch (error) {
    next(error);
  }
};

export const getBookmarksByPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;

    const bookmarks = await selectBookmarksByPost(post_id);

    res.status(200).send({ status: "success", data: { bookmarks } });
  } catch (error) {
    next(error);
  }
};

export const getBookmarksByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;

    const bookmarks = await selectBookmarksByUser(user_id);

    res.status(200).send({ status: "success", data: { bookmarks } });
  } catch (error) {
    next(error);
  }
};

export const getMyBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.user;

    const bookmarks = await selectBookmarksByUser(user_id);

    res.status(200).send({ status: "success", data: { bookmarks } });
  } catch (error) {
    next(error);
  }
};
