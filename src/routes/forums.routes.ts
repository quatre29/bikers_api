import express from "express";
import {
  addNewForum,
  addNewSubForum,
  createNewForumCategory,
  deleteForumCategory,
  getAllForumCategories,
  getForumsByCategoryId,
  getSubForumsByForumId,
  removeForum,
  getForumById,
  updateForumCategory,
  updateForum,
} from "../controllers/forums.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";

const forumsRouter = express.Router();

forumsRouter
  .route("/categories")
  .get(isAuthenticated, getAllForumCategories)
  .post(
    isAuthenticated,
    restrictTo("admin", "moderator"),
    createNewForumCategory
  );

forumsRouter
  .route("/:forum_id")
  .get(isAuthenticated, restrictTo("admin"), getForumById)
  .delete(isAuthenticated, restrictTo("admin"), removeForum)
  .patch(isAuthenticated, restrictTo("admin", "moderator"), updateForum);

forumsRouter
  .route("/categories/:category_id/forums")
  .get(isAuthenticated, getForumsByCategoryId)
  .post(isAuthenticated, restrictTo("admin", "moderator"), addNewForum);

forumsRouter
  .route("/categories/:category_id")
  .delete(
    isAuthenticated,
    restrictTo("admin", "moderator"),
    deleteForumCategory
  )
  .patch(
    isAuthenticated,
    restrictTo("admin", "moderator"),
    updateForumCategory
  );

forumsRouter
  .route("/:forum_id/sub-forums")
  .get(isAuthenticated, getSubForumsByForumId)
  .post(isAuthenticated, restrictTo("admin", "moderator"), addNewSubForum);

export default forumsRouter;
