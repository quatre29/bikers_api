import express from "express";
import {
  createBlogPost,
  deleteBlogPost,
  editBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  rateBlogPost,
  getRatingsByBlogPost,
} from "../controllers/blog-posts.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";
import blogCommentsRouter from "./blog-comments.routes";

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

blogPostsRouter.use("/:post_id/comments", blogCommentsRouter);

export default blogPostsRouter;
