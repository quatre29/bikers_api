import express from "express";
import {
  createBlogPost,
  deleteBlogPost,
  editBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  rateBlogPost,
} from "../controllers/blog-posts.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";

const blogPostsRouter = express.Router();

blogPostsRouter.route("/").get(getAllBlogPosts).post(createBlogPost);
blogPostsRouter
  .route("/:blog_post")
  .get(getBlogPostById)
  .delete(deleteBlogPost);

blogPostsRouter.route("/:blog_post/edit").patch(editBlogPost);
blogPostsRouter.route("/:blog_post/rate").patch(rateBlogPost);

export default blogPostsRouter;
