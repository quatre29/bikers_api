import express from "express";
import {
  createNewTopic,
  editTopic,
  getTopicById,
  getTopicsByForumId,
  lockTopic,
  removeTopic,
  _getALlTopics,
} from "../controllers/forum-topics.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";

const forumTopicsRouter = express.Router({ mergeParams: true });

forumTopicsRouter
  .route("/")
  .post(isAuthenticated, createNewTopic)
  .get(isAuthenticated, getTopicsByForumId);

forumTopicsRouter
  .route("/all")
  .get(isAuthenticated, restrictTo("admin"), _getALlTopics);

forumTopicsRouter
  .route("/:topic_id")
  .get(isAuthenticated, getTopicById)
  .delete(isAuthenticated, removeTopic)
  .patch(isAuthenticated, editTopic);

forumTopicsRouter
  .route("/:topic_id/lock")
  .patch(isAuthenticated, restrictTo("admin", "moderator"), lockTopic);

export default forumTopicsRouter;
