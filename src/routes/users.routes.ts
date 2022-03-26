import express from "express";
import {
  signup,
  login,
  logout,
  getAllUsers,
  changePassword,
  deleteUserById,
} from "../controllers/users.controllers";
import { isAuthenticated, restrictTo } from "../middleware/auth";

const usersRouter = express.Router();

usersRouter.route("/").post(signup).get(isAuthenticated, getAllUsers);
usersRouter
  .route("/:user_id")
  .delete(isAuthenticated, restrictTo("admin"), deleteUserById);
usersRouter.route("/change_password").patch(changePassword);
usersRouter.route("/login").post(login);
usersRouter.route("/logout").post(logout);

export default usersRouter;
