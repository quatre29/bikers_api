import express from "express";
import {
  getAllUsers,
  deleteUserById,
  updateMe,
  deactivateMe,
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

const usersRouter = express.Router();

usersRouter.route("/").post(signup).get(isAuthenticated, getAllUsers);

usersRouter.route("/update_me").patch(isAuthenticated, updateMe);
usersRouter.route("/deactivate_me").delete(isAuthenticated, deactivateMe);

usersRouter.route("/forgot_password").post(forgotPassword);
usersRouter.route("/reset_password/:token").patch(resetPassword);
usersRouter.route("/update_password").patch(isAuthenticated, updatePassword);

usersRouter.route("/login").post(login);
// usersRouter.route("/logout").post(logout);

usersRouter
  .route("/:user_id")
  .delete(isAuthenticated, restrictTo("admin"), deleteUserById);

export default usersRouter;
