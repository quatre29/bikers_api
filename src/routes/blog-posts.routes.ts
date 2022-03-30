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

export default blogPostsRouter;
