import express from "express";
import { login, logout } from "../controllers/auth.controllers";

const authRouter = express.Router();

authRouter.route("/login").post(login);
authRouter.route("/logout").post(logout);

export default authRouter;
