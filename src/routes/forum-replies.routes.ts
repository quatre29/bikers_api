import express from "express";
import {
  addReply,
  editReply,
  getRepliesByTopic,
  getReplyById,
  removeReply,
} from "../controllers/forum-replies.controllers";
import { isAuthenticated } from "../middleware/auth";

const forumRepliesRouter = express.Router();

forumRepliesRouter
  .route("/")
  .post(isAuthenticated, addReply)
  .get(isAuthenticated, getRepliesByTopic);

forumRepliesRouter
  .route("/:reply_id")
  .get(isAuthenticated, getReplyById)
  .patch(isAuthenticated, editReply)
  .delete(isAuthenticated, removeReply);

export default forumRepliesRouter;
