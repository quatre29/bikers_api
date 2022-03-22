import express from "express";
import { signUp, login, logout } from "../controllers/auth.controllers";

const authRouter = express.Router();

authRouter.route("/sign_up").post(signUp);
authRouter.route("/login").post(login);
authRouter.route("/logout").post(logout);

export default authRouter;
