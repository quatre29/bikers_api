import { Request, Response, NextFunction, query } from "express";
import { nextTick } from "process";
import { BlogPost } from "../data-types/dataTypes";
import AppError from "../errors/AppError";
import {
  insertBlogPostRating,
  insertNewBlogPost,
  removeBlogPostById,
  selectAllBlogPosts,
  selectBlogPostById,
  selectBlogPostsPartial,
  selectMyBlogPostRating,
  selectRatingsByBlogPost,
  selectRatingsByUser,
  updateBlogPost,
  updatePinnedBlogPost,
} from "../models/blog-posts.model";
import { checkIfRowExists } from "../utils/check";
import cloudinary from "../utils/cloudinary";
import {
  validateBlogPostSchema,
  validatePartialBlogPostsSchema,
  validatePinBlogPostBody,
  validateRatingSchema,
  validateUpdateBlogPostSchema,
} from "../utils/validate";

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banner = req.body.post_banner;
    let cloudinary_banner = null;

    if (banner && banner !== "") {
      const uploadRes = await cloudinary.uploader.upload(banner, {
        upload_preset: "blog_post_banner_upload",
      });

      cloudinary_banner = uploadRes.public_id;
    }

    const newPost: BlogPost = {
      ...req.body,
      post_banner: cloudinary_banner,
      author: req.user.username,
      author_id: req.user.user_id,
    };

    const valid = validateBlogPostSchema(newPost);

    if (!valid.valid) {
      return next(new AppError(valid.msg!, 400));
    }

    const post = await insertNewBlogPost(newPost);

    res.status(201).send({ status: "success", data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = req.query;
    const page = queryParams["page"] as string;
    const limit = queryParams["limit"] as string;
    const title = queryParams["title"] as string;
    const author = queryParams["author"] as string;
    const tag = queryParams["tag"] as string;
    const pinned = queryParams["pinned"] as string;

    const posts = await selectAllBlogPosts(
      page,
      limit,
      title,
      author,
      tag,
      pinned
    );

    res.status(200).send({ status: "success", data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;
    const post = await selectBlogPostById(post_id, user_id);

    if (!post) {
      return next(new AppError("No post could be found", 404));
    }

    res.status(200).send({ status: "success", data: { post } });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const post = await checkIfRowExists(post_id, "blog_posts");

    if (!post) {
      return next(
        new AppError(`Blog Post with id - ${post_id} does not exist`, 404)
      );
    }

    if (
      post.author === req.user.username ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      await removeBlogPostById(post_id);
    } else {
      return next(
        new AppError("You don't have access deleting this post", 401)
      );
    }

    res.status(204).send({ status: "success", msg: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

export const rateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;
    const { rating } = req.body;

    const post = await checkIfRowExists(post_id, "blog_posts");

    if (!post) {
      return next(
        new AppError(`Blog Post with id - ${post_id} does not exist`, 404)
      );
    }

    const validRating = validateRatingSchema(rating);

    if (!validRating.valid) {
      return next(new AppError(validRating.msg!, 400));
    }

    const newRating = await insertBlogPostRating(
      post_id,
      req.user.user_id,
      validRating.value
    );

    res.status(201).send({ status: "success", data: { rating: newRating } });
  } catch (error) {
    next(error);
  }
};

export const getRatingsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.params;

    const ratings = await selectRatingsByUser(user_id);

    res.status(201).send({ status: "success", data: { ratings } });
  } catch (error) {
    next(error);
  }
};

export const getMyBlogPostRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;

    const rating = await selectMyBlogPostRating(post_id, req.user.user_id);

    res.status(201).send({ status: "success", data: { rating } });
  } catch (error) {
    next(error);
  }
};

export const getRatingsByBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { post_id } = req.params;

    const ratings = await selectRatingsByBlogPost(post_id);

    res.status(200).send({ status: "success", data: { ratings } });
  } catch (error) {
    next(error);
  }
};

export const editBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { post_banner } = req.body;
    let banner = post_banner;

    if (
      typeof banner === "string" &&
      banner.startsWith("data") &&
      banner !== ""
    ) {
      const uploadRes = await cloudinary.uploader.upload(banner, {
        upload_preset: "blog_post_banner_upload",
      });

      banner = uploadRes.public_id;
    }

    const { post_id } = req.params;
    const { user_id } = req.user;
    const updates = {
      ...req.body,
      post_banner: banner,
    };

    const validUpdates = validateUpdateBlogPostSchema(updates);

    if (!validUpdates.valid) {
      return next(new AppError(validUpdates.msg!, 400));
    }

    const post = await updateBlogPost(updates, post_id, user_id);
    if (!post) {
      return next(new AppError("Blog post does not exist", 404));
    }

    res.status(200).send({ status: "success", data: { post } });
  } catch (error) {
    next(error);
  }
};

export const pinBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pinned } = req.body;
    const { post_id } = req.params;

    const validBody = validatePinBlogPostBody(pinned, post_id);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const post = await updatePinnedBlogPost(pinned, post_id);

    res.status(200).send({ status: "success", data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostsBySearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { queryStr } = req.params;

    const validQuery = validatePartialBlogPostsSchema(queryStr);

    if (!validQuery.valid) {
      return next(new AppError(validQuery.msg!, 400));
    }

    const posts = await selectBlogPostsPartial(queryStr.toLowerCase());

    res.status(200).send({ status: "success", data: { posts } });
  } catch (error) {
    next(error);
  }
};
