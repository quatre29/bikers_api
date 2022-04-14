import express from "express";
import {
  createBlogPost,
  deleteBlogPost,
  editBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  rateBlogPost,
  getRatingsByBlogPost,
  getMyBlogPostRating,
} from "../controllers/blog-posts.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";
import blogCommentsRouter from "./blog-comments.routes";

import {
  bookmarkBlogPost,
  unBookmarkBlogPost,
  getBookmarksByPost,
} from "../controllers/blog-bookmarks.controllers";

const blogPostsRouter = express.Router();

blogPostsRouter
  .route("/")
  .get(isAuthenticated, getAllBlogPosts)
  .post(isAuthenticated, createBlogPost);
blogPostsRouter
  .route("/:post_id")
  .get(isAuthenticated, getBlogPostById)
  .delete(isAuthenticated, deleteBlogPost);

blogPostsRouter.route("/:post_id/edit").patch(isAuthenticated, editBlogPost);
blogPostsRouter
  .route("/:post_id/rating")
  .post(isAuthenticated, rateBlogPost)
  .get(isAuthenticated, getRatingsByBlogPost);

blogPostsRouter
  .route("/:post_id/bookmark")
  .get(isAuthenticated, getBookmarksByPost)
  .post(isAuthenticated, bookmarkBlogPost)
  .delete(isAuthenticated, unBookmarkBlogPost);

blogPostsRouter
  .route("/:post_id/my-rating")
  .get(isAuthenticated, getMyBlogPostRating);

blogPostsRouter.use("/:post_id/comments", blogCommentsRouter);

export default blogPostsRouter;
