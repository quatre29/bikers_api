import express from "express";
import {
  getAllUsers,
  deleteUserById,
  updateMe,
  deactivateMe,
  getUserById,
  _changeUserRole,
  getLoggedInUser,
} from "../controllers/users.controllers";

import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller";
import { isAuthenticated, restrictTo } from "../middleware/auth";
import { getBookmarksByUser } from "../controllers/blog-bookmarks.controllers";
import { getRatingsByUser } from "../controllers/blog-posts.controllers";

const usersRouter = express.Router();

usersRouter.route("/").post(signup).get(isAuthenticated, getAllUsers);

usersRouter.route("/me").get(isAuthenticated, getLoggedInUser);
usersRouter.route("/update_me").patch(isAuthenticated, updateMe);
usersRouter.route("/deactivate_me").delete(isAuthenticated, deactivateMe);

usersRouter.route("/forgot_password").post(forgotPassword);
usersRouter.route("/reset_password/:token").patch(resetPassword);
usersRouter.route("/update_password").patch(isAuthenticated, updatePassword);

usersRouter.route("/login").post(login);
usersRouter.route("/logout").post(isAuthenticated, logout);

usersRouter
  .route("/:user_id")
  .get(isAuthenticated, getUserById)
  .delete(isAuthenticated, restrictTo("admin"), deleteUserById);

usersRouter
  .route("/:user_id/bookmarks")
  .get(isAuthenticated, getBookmarksByUser);

usersRouter.route("/:user_id/ratings").get(isAuthenticated, getRatingsByUser);

//TODO: add restrictTo('admin') middleware
usersRouter
  .route("/:user_id/change_role")
  .patch(isAuthenticated, _changeUserRole);
export default usersRouter;
