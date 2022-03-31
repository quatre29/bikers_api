import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  insertNewComment,
  removeBlogComment,
  selectBlogCommentOnPost,
  selectBlogPostComments,
  updateBlogComment,
} from "../models/blog-comments.model";
import { checkIfRowExists } from "../utils/check";

export const addNewComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const { body } = req.body;
    const author = req.user.username;

    if (!body) {
      return next(
        new AppError("Body request requires a body for comment", 400)
      );
    }

    const comment = await insertNewComment(post_id, body, author);

    if (!comment) {
      return next(
        new AppError("Something went wrong posting a new comment", 400)
      );
    }

    res.status(201).send({ status: "success", data: { comment } });
  } catch (error) {
    next(error);
  }
};

export const editBlogComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id, comment_id } = req.params;
    const { body } = req.body;
    const { role, username } = req.user;

    if (!body) {
      return next(
        new AppError("Body request requires a body for comment", 400)
      );
    }

    const commentValid = await selectBlogCommentOnPost(post_id, comment_id);

    if (!commentValid) {
      return next(new AppError("Comment or post could not be found", 404));
    }

    if (
      commentValid.author !== username &&
      role !== "admin" &&
      role !== "moderator"
    ) {
      return next(
        new AppError("You don't have access updating this comment", 401)
      );
    }

    const comment = await updateBlogComment(post_id, comment_id, body);

    res.status(200).send({ status: "success", data: { comment } });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;

    const post = await checkIfRowExists(post_id, "blog_posts");

    if (!post) {
      return next(new AppError("Blog post could not be found", 404));
    }

    const comments = await selectBlogPostComments(post_id);

    res.status(200).send({ status: "success", data: { comments } });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id, comment_id } = req.params;
    const { username, role } = req.user;

    const commentValid = await selectBlogCommentOnPost(post_id, comment_id);

    if (!commentValid) {
      return next(new AppError("Comment or post could not be found", 404));
    }

    if (
      commentValid.author !== username &&
      role !== "admin" &&
      role !== "moderator"
    ) {
      return next(
        new AppError("You don't have access deleting this comment", 401)
      );
    }

    await removeBlogComment(post_id, comment_id);

    res.status(204).send({ status: "success", msg: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};
