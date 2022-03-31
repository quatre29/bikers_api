import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  addNewComment,
  deleteBlogComment,
  editBlogComment,
  getBlogPostComments,
} from "../controllers/blog-comments.controllers";

const blogCommentsRouter = express.Router({ mergeParams: true });

blogCommentsRouter
  .route("/")
  .get(isAuthenticated, getBlogPostComments)
  .post(isAuthenticated, addNewComment);

blogCommentsRouter
  .route("/:comment_id")
  .patch(isAuthenticated, editBlogComment)
  .delete(isAuthenticated, deleteBlogComment);

export default blogCommentsRouter;
